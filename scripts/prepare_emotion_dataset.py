import os
import re
import unicodedata
import hashlib
import json
import pandas as pd
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 22-Emotion Configuration
EMOTIONS = [
    "joy", "affection", "amusement", "surprise", "sadness", "anger",
    "care_empathy", "fear", "disgust", "approval", "sarcasm", "pride",
    "gratitude", "disappointment", "grief", "jealousy", "confusion",
    "nostalgia", "hope", "excitement", "relief", "embarrassment"
]

def normalize_text(text):
    if pd.isna(text): return ""
    t = str(text)
    t = unicodedata.normalize('NFC', t)
    t = re.sub(r'[\u200b\u200c\u200d\ufeff]', '', t)
    t = t.lower()
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def hash_text(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def main():
    print("=" * 70)
    print(" PREPARING EMOTION-22 V2 DATASET RELEASE (5000 POSTS)")
    print("=" * 70)

    # 1. Load Annotations
    annotator_path = ROOT / 'data' / 'annotations' / 'facebook_posts_annotation_ready.xlsx'
    if not annotator_path.exists():
        annotator_path = ROOT / 'facebook_posts_annotation_ready.xlsx'
    print(f"Loading annotations from: {annotator_path}")
    df_anno = pd.read_excel(annotator_path, sheet_name='FB Posts (All 5000)')
    print(f"Total raw rows in annotation sheet: {len(df_anno)}")

    # 2. Load Raw Reactions
    raw_path = ROOT / 'data' / 'raw' / 'facebook_posts_final.xlsx'
    if not raw_path.exists():
        raw_path = ROOT / 'facebook_posts_final.xlsx'
    print(f"Loading reactions from: {raw_path}")
    df_raw = pd.read_excel(raw_path)

    # Standardize column names
    df_anno = df_anno.rename(columns={'#': 'source_id', 'Post Text': 'post_text'})
    df_raw = df_raw.rename(columns={
        '#': 'source_id',
        'Likes': 'like_count',
        'Love': 'love_count',
        'Care': 'care_count',
        'Haha': 'haha_count',
        'Wow': 'wow_count',
        'Sad': 'sad_count',
        'Angry': 'angry_count'
    })

    reaction_cols = ['like_count', 'love_count', 'care_count', 'haha_count', 'wow_count', 'sad_count', 'angry_count']

    # Merge on source_id
    df = pd.merge(df_anno, df_raw[['source_id'] + reaction_cols], on='source_id', how='left')

    # Fill reaction NaNs
    for c in reaction_cols:
        df[c] = df[c].fillna(0).astype(int)

    # 3. Filter out invalid/empty text rows
    initial_count = len(df)
    df = df[df['post_text'].notna() & (df['post_text'].astype(str).str.strip() != '')].copy()
    dropped_count = initial_count - len(df)
    print(f"Dropped {dropped_count} records with empty/NaN post text. Valid posts: {len(df)}")

    # 4. Text Normalization and Hashing
    df['normalized_text'] = df['post_text'].apply(normalize_text)
    df['text_hash'] = df['normalized_text'].apply(hash_text)

    # 5. Process 22 Binary Emotions and Masks
    for emo in EMOTIONS:
        col_data = df[emo].astype(str).str.strip().str.lower()
        df[emo] = (col_data == 'yes').astype(int)
        df[f"{emo}_mask"] = 1  # Full certainty for clean yes/no annotations

    # Retain sentiment as reference ground-truth
    if 'sentiment' in df.columns:
        df['annotated_sentiment'] = df['sentiment']

    # Keep relevant columns
    keep_cols = (
        ['source_id', 'post_text', 'normalized_text', 'text_hash', 'annotated_sentiment'] +
        reaction_cols +
        EMOTIONS +
        [f"{e}_mask" for e in EMOTIONS]
    )
    df = df[keep_cols]

    # 6. Leakage-Safe Deterministic Rare-Label Hash-Grouped Split (70/15/15)
    print("Performing deterministic rare-label hash-grouped split (70/15/15)...")
    hash_groups = df.groupby('text_hash')[EMOTIONS].max()
    hash_counts = df.groupby('text_hash').size()

    emotion_freq = hash_groups.sum(axis=0)
    emotion_rarity = 1.0 / (emotion_freq + 1e-5)
    group_rarity = hash_groups.dot(emotion_rarity)

    # Sort hashes by rarity, count, hash string for determinism
    sorted_hashes = sorted(
        hash_groups.index.tolist(),
        key=lambda h: (group_rarity[h], hash_counts[h], h),
        reverse=True
    )

    targets = {'train': 0.70, 'validation': 0.15, 'test': 0.15}
    current_counts = {'train': 0, 'validation': 0, 'test': 0}
    current_emotions = {b: np.zeros(len(EMOTIONS)) for b in targets.keys()}

    hash_to_split = {}
    for h in sorted_hashes:
        group_size = hash_counts[h]
        group_emos = hash_groups.loc[h].values

        active_emos = np.where(group_emos > 0)[0]
        if len(active_emos) > 0:
            rarest_emo_idx = max(active_emos, key=lambda idx: emotion_rarity[EMOTIONS[idx]])
            total_emo_so_far = sum(current_emotions[b][rarest_emo_idx] for b in targets)
            if total_emo_so_far == 0:
                deficits = {b: targets[b] for b in targets}
            else:
                deficits = {
                    b: targets[b] - (current_emotions[b][rarest_emo_idx] / total_emo_so_far)
                    for b in targets
                }
            best_bucket = max(deficits, key=deficits.get)
        else:
            deficits = {
                b: targets[b] - (current_counts[b] / max(1, sum(current_counts.values())))
                for b in targets
            }
            best_bucket = max(deficits, key=deficits.get)

        hash_to_split[h] = best_bucket
        current_counts[best_bucket] += group_size
        current_emotions[best_bucket] += group_emos

    df['split'] = df['text_hash'].map(hash_to_split)

    # Assert 0 text hash leakage across splits
    train_hashes = set(df[df['split'] == 'train']['text_hash'])
    val_hashes = set(df[df['split'] == 'validation']['text_hash'])
    test_hashes = set(df[df['split'] == 'test']['text_hash'])

    assert not train_hashes & val_hashes, "Data Leakage: Train/Val overlap!"
    assert not train_hashes & test_hashes, "Data Leakage: Train/Test overlap!"
    assert not val_hashes & test_hashes, "Data Leakage: Val/Test overlap!"

    print(f"Splits successfully created (Zero Leakage):")
    print(f"  Train      : {current_counts['train']:4d} ({current_counts['train']/len(df)*100:.1f}%)")
    print(f"  Validation : {current_counts['validation']:4d} ({current_counts['validation']/len(df)*100:.1f}%)")
    print(f"  Test       : {current_counts['test']:4d} ({current_counts['test']/len(df)*100:.1f}%)")

    # 7. Save outputs to data/releases/emotion_22_v2
    release_dir = ROOT / 'data' / 'releases' / 'emotion_22_v2'
    release_dir.mkdir(parents=True, exist_ok=True)

    df.drop(columns=['split']).to_csv(release_dir / 'dataset.csv', index=False)
    for split_name in ['train', 'validation', 'test']:
        split_df = df[df['split'] == split_name].drop(columns=['split'])
        split_df.to_csv(release_dir / f'{split_name}.csv', index=False)

    metadata = {
        "version": "2.0",
        "description": "22-emotion leakage-safe dataset (5000 posts) with 7 Facebook reactions",
        "total_rows": len(df),
        "splits": {
            "train": int(current_counts['train']),
            "validation": int(current_counts['validation']),
            "test": int(current_counts['test'])
        },
        "emotion_order": EMOTIONS
    }
    with open(release_dir / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\nDataset release saved successfully to: {release_dir}")
    print("=" * 70)

if __name__ == '__main__':
    main()
