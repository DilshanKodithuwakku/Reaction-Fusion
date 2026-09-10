"""
scripts/annotate_with_gemini.py

Automated multi-label emotion and sentiment annotation of 5,000 Sinhala Facebook posts
using the Google GenAI SDK with strict Gemini Free Tier optimization.

Key Free-Tier Upgrades:
- Batch Size 10 (10 posts per API call): Reduces 2,565 remaining posts to just ~256 requests,
  guaranteeing it stays well below the 500 Requests/Day Free Tier limit!
- Dual-Model Failover: If gemini-3.1-flash-lite reaches quota, it seamlessly fails over to
  gemini-3-flash-preview (which has its own separate quota pool).
- Adaptive Retry: Automatically detects Google's retry-after delay if 429 occurs.
- Resumable Checkpointing: Saves directly into the workbook every 20-30 posts.
- Cultural Persona: 'Think as a native Sinhala person'.
"""

import os
import sys
import time
import re
import argparse
from pathlib import Path
from typing import List, Literal, Optional
import pandas as pd
import openpyxl
from pydantic import BaseModel, Field

# Suppress AFC warning from google-genai
import warnings
import logging
warnings.filterwarnings("ignore")
logging.getLogger("google_genai").setLevel(logging.ERROR)

# Ensure UTF-8 line-buffered output
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)

# Project Root and Environment
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'src'))

# Load .env safely
from dotenv import load_dotenv
env_file = ROOT / '.env'
if env_file.exists():
    load_dotenv(env_file)

# 22 Emotion Columns in exact workbook order
EMOTIONS = [
    "joy", "affection", "amusement", "surprise", "sadness", "anger",
    "care_empathy", "fear", "disgust", "approval", "sarcasm", "pride",
    "gratitude", "disappointment", "grief", "jealousy", "confusion",
    "nostalgia", "hope", "excitement", "relief", "embarrassment"
]

# Pydantic Schemas for Structured GenAI Output
class SinglePostAnnotation(BaseModel):
    post_id: int = Field(description="The exact post ID (#) from the prompt")
    sentiment: Literal["Positive", "Negative", "Neutral", "mixed"] = Field(
        description="Overall sentiment: Positive, Negative, Neutral, or mixed"
    )
    joy: Literal["yes", "no"]
    affection: Literal["yes", "no"]
    amusement: Literal["yes", "no"]
    surprise: Literal["yes", "no"]
    sadness: Literal["yes", "no"]
    anger: Literal["yes", "no"]
    care_empathy: Literal["yes", "no"]
    fear: Literal["yes", "no"]
    disgust: Literal["yes", "no"]
    approval: Literal["yes", "no"]
    sarcasm: Literal["yes", "no"]
    pride: Literal["yes", "no"]
    gratitude: Literal["yes", "no"]
    disappointment: Literal["yes", "no"]
    grief: Literal["yes", "no"]
    jealousy: Literal["yes", "no"]
    confusion: Literal["yes", "no"]
    nostalgia: Literal["yes", "no"]
    hope: Literal["yes", "no"]
    excitement: Literal["yes", "no"]
    relief: Literal["yes", "no"]
    embarrassment: Literal["yes", "no"]

class BatchPostAnnotation(BaseModel):
    annotations: List[SinglePostAnnotation] = Field(
        description="List of annotations matching each input post ID"
    )

SYSTEM_INSTRUCTION = """
You must think as a native Sinhala person living in Sri Lanka.
Read each post through the cultural mindset, emotional intuition, and daily experience of a native Sri Lankan who understands colloquial Sinhala, informal spelling, political humor, sarcasm, Singlish, memes, and current Sri Lankan socio-cultural dynamics.

Your task is to analyze each Sinhala Facebook post and classify:
1. Overall Sentiment: Must be strictly one of: 'Positive', 'Negative', 'Neutral', 'mixed'.
2. Multi-Label Emotions: For each of the 22 fine-grained emotions, choose strictly 'yes' or 'no'.

CULTURAL & EMOTIONAL GUIDELINES:
- Think as a Sinhala native person: Recognize when words that seem polite or positive on the surface are actually biting sarcasm, satire, or mocking criticism!
- Sarcasm: When a post says something like "හරිම ශෝක් වැඩක්", "අපේ රට සංවර්ධනය වෙනවා", or uses emojis like 🙄, 🥴, 💀 to mock, mark 'sarcasm' as 'yes' and identify the true underlying sentiment (usually 'Negative') and emotions (often 'anger', 'disappointment', or 'amusement').
- Mixed Emotions: Posts can celebrate while grieving, or laugh while feeling disgusted. Mark 'mixed' sentiment when strong conflicting emotions co-exist.
- Colloquial terms & Slang: Interpret terms like "ආතල්", "වදන්", "සෝෂල් මීඩියා", "කාලකන්නි", "සුපිරි", "පව්", "හිත පිරෙනවා" in their natural cultural sense.

MANDATORY RULES:
1. Multiple emotions can and should be marked 'yes' if they co-exist in the post.
2. CRITICAL: At least ONE emotion MUST be marked 'yes' for every post. You cannot set all 22 emotions to 'no'.
3. For each post in the batch, return an annotation entry with its corresponding post_id (#).
"""

MODELS_POOL = ["gemini-3.1-flash-lite", "gemini-3-flash-preview"]

def annotate_batch(client, model_name: str, batch: list, max_retries: int = 5) -> tuple[dict, str]:
    """
    Sends a mini-batch of posts to Gemini with structured output,
    handling rate-limits (429), retry delays, and model failover.
    Returns (results_by_id, active_model_name).
    """
    from google.genai import errors

    prompt = "Annotate the following Sinhala Facebook posts as a native Sinhala person:\n\n"
    for item in batch:
        pid = item['post_id']
        text = item['text']
        prompt += f"--- POST ID #{pid} ---\n{text}\n\n"

    current_model = model_name
    model_idx = MODELS_POOL.index(current_model) if current_model in MODELS_POOL else 0

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=current_model,
                contents=prompt,
                config={
                    "system_instruction": SYSTEM_INSTRUCTION,
                    "response_mime_type": "application/json",
                    "response_schema": BatchPostAnnotation,
                    "temperature": 0.1,
                }
            )
            parsed: BatchPostAnnotation = response.parsed

            results_by_id = {}
            for anno in parsed.annotations:
                # Sanity check: Ensure at least one emotion is 'yes'
                all_no = all(getattr(anno, emo) == "no" for emo in EMOTIONS)
                if all_no:
                    if anno.sentiment == "Positive": anno.approval = "yes"
                    elif anno.sentiment == "Negative": anno.disappointment = "yes"
                    else: anno.confusion = "yes"
                results_by_id[anno.post_id] = anno

            return results_by_id, current_model

        except errors.APIError as e:
            err_str = str(e)
            # Try to parse suggested retry delay from error message (e.g. 'retry in 41.2s')
            retry_match = re.search(r'retry in ([0-9\.]+)s', err_str)
            wait_time = float(retry_match.group(1)) + 2.0 if retry_match else 45.0

            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                print(f"\n[Notice] 429 Quota reached on {current_model}.")
                # Failover to next available model in pool
                next_model_idx = (model_idx + 1) % len(MODELS_POOL)
                next_model = MODELS_POOL[next_model_idx]
                
                if next_model != current_model:
                    print(f"[Model Failover] Switching model: {current_model} -> {next_model} (Attempt {attempt+1}/{max_retries})...")
                    current_model = next_model
                    model_idx = next_model_idx
                    time.sleep(3.0)
                else:
                    print(f"[Cooldown] Pausing for {wait_time:.1f}s before retry (Attempt {attempt+1}/{max_retries})...")
                    time.sleep(wait_time)
            elif "503" in err_str or "UNAVAILABLE" in err_str:
                print(f"\n[Server Busy] High demand on {current_model}. Pausing for {wait_time:.1f}s...")
                time.sleep(wait_time)
            else:
                print(f"\n[API Error] {err_str[:160]}. Retrying in 10s...")
                time.sleep(10.0)

            if attempt == max_retries - 1:
                raise e
        except Exception as e:
            print(f"\n[Unexpected Error] {str(e)[:160]}. Retrying in 10s...")
            time.sleep(10.0)
            if attempt == max_retries - 1:
                raise e

    raise RuntimeError("Failed to annotate batch after maximum retries.")

def main():
    parser = argparse.ArgumentParser(description="Annotate 5000 Facebook Posts using Gemini Free Tier")
    parser.add_argument("--input", type=str, default="facebook_posts_annotation_ready.xlsx",
                        help="Path to the annotation workbook")
    parser.add_argument("--sheet", type=str, default="FB Posts (All 5000)",
                        help="Name of the posts sheet")
    parser.add_argument("--output", type=str, default=None,
                        help="Path to save annotated workbook (defaults to input path)")
    parser.add_argument("--model", type=str, default="gemini-3.1-flash-lite",
                        help="Initial Gemini model name")
    parser.add_argument("--batch-size", type=int, default=10,
                        help="Number of posts per API call (default 10: completes 2565 posts in only ~256 requests!)")
    parser.add_argument("--delay", type=float, default=4.5,
                        help="Delay in seconds between requests (4.5s keeps RPM at ~13.3, below 15 RPM limit)")
    parser.add_argument("--checkpoint-every", type=int, default=30,
                        help="Save workbook checkpoint every N posts")
    parser.add_argument("--limit", type=int, default=None,
                        help="Limit total posts to annotate (useful for testing)")
    parser.add_argument("--overwrite", action="store_true",
                        help="Overwrite existing annotations in the sheet")
    args = parser.parse_args()

    # Verify API key
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("\n" + "="*70)
        print(" ERROR: GEMINI_API_KEY is not set in .env or environment!")
        print("="*70)
        sys.exit(1)

    from google import genai
    client = genai.Client(api_key=api_key)

    input_path = Path(args.input)
    if not input_path.exists():
        input_path = ROOT / args.input
        if not input_path.exists():
            print(f"Error: Could not find workbook at {args.input}")
            sys.exit(1)

    output_path = Path(args.output) if args.output else input_path

    print("=" * 75)
    print(" REACTIONFUSION: GEMINI FREE-TIER ANNOTATION ENGINE (OPTIMIZED)")
    print("=" * 75)
    print(f"Workbook       : {input_path}")
    print(f"Sheet          : {args.sheet}")
    print(f"Model Pool     : {' -> '.join(MODELS_POOL)} (Auto-Failover Enabled)")
    print(f"Batch Size     : {args.batch_size} posts/request (Total ~256 requests remaining)")
    print(f"Paced Delay    : {args.delay}s between requests (Safe for 15 RPM limit)")
    print(f"Persona        : Think as a Native Sinhala Person")
    print("=" * 75)

    print("Loading workbook...")
    wb = openpyxl.load_workbook(input_path)
    if args.sheet not in wb.sheetnames:
        print(f"Error: Sheet '{args.sheet}' not found in {input_path}. Available: {wb.sheetnames}")
        sys.exit(1)

    ws = wb[args.sheet]

    # Map headers
    headers = [cell.value for cell in ws[1]]
    col_map = {name: idx + 1 for idx, name in enumerate(headers) if name}

    required_cols = ['#', 'Post Text', 'sentiment'] + EMOTIONS
    missing = [c for c in required_cols if c not in col_map]
    if missing:
        print(f"Error: Missing columns in sheet: {missing}")
        sys.exit(1)

    # Collect pending rows
    pending_items = []
    already_annotated = 0
    for row_idx in range(2, ws.max_row + 1):
        pid = ws.cell(row=row_idx, column=col_map['#']).value
        text = ws.cell(row=row_idx, column=col_map['Post Text']).value
        sent_val = ws.cell(row=row_idx, column=col_map['sentiment']).value

        if not args.overwrite and sent_val is not None and str(sent_val).strip() != '':
            already_annotated += 1
        else:
            pending_items.append({
                'row_idx': row_idx,
                'post_id': int(pid) if pid is not None else row_idx - 1,
                'text': str(text).strip() if pd.notna(text) else ''
            })

    if args.limit:
        pending_items = pending_items[:args.limit]

    total_pending = len(pending_items)
    print(f"Already Completed  : {already_annotated} / {ws.max_row - 1}")
    print(f"Remaining to Do    : {total_pending} posts")
    if total_pending == 0:
        print("All rows in the workbook are already annotated. Nothing to do!")
        sys.exit(0)

    batches = [pending_items[i:i + args.batch_size] for i in range(0, total_pending, args.batch_size)]
    total_batches = len(batches)
    print(f"API Requests to Make: {total_batches} requests (Safe for Daily Quota)")
    est_minutes = (total_batches * (args.delay + 1.8)) / 60.0
    print(f"Estimated Time      : ~{est_minutes:.1f} minutes")
    print("-" * 75)

    start_time = time.time()
    processed_posts = 0
    active_model = args.model

    try:
        for b_idx, batch in enumerate(batches, 1):
            batch_to_query = []
            for item in batch:
                if not item['text']:
                    r = item['row_idx']
                    ws.cell(row=r, column=col_map['sentiment']).value = "Neutral"
                    for emo in EMOTIONS:
                        ws.cell(row=r, column=col_map[emo]).value = "yes" if emo == "confusion" else "no"
                    processed_posts += 1
                else:
                    batch_to_query.append(item)

            if batch_to_query:
                results_by_id, active_model = annotate_batch(
                    client=client,
                    model_name=active_model,
                    batch=batch_to_query
                )

                for item in batch_to_query:
                    pid = item['post_id']
                    r = item['row_idx']
                    if pid in results_by_id:
                        anno = results_by_id[pid]
                        ws.cell(row=r, column=col_map['sentiment']).value = anno.sentiment
                        for emo in EMOTIONS:
                            ws.cell(row=r, column=col_map[emo]).value = getattr(anno, emo)
                    else:
                        ws.cell(row=r, column=col_map['sentiment']).value = "Neutral"
                        for emo in EMOTIONS:
                            ws.cell(row=r, column=col_map[emo]).value = "yes" if emo == "confusion" else "no"

                    processed_posts += 1

            # Progress output
            elapsed = time.time() - start_time
            rpm = (b_idx / (elapsed / 60.0)) if elapsed > 0 else 0
            remaining_batches = total_batches - b_idx
            eta_mins = (remaining_batches * (args.delay + 1.8)) / 60.0

            first_p = batch[0]
            first_text_preview = (first_p['text'][:30] + "...") if first_p['text'] else "[BLANK]"
            print(f"[{b_idx:3d}/{total_batches}] Posts {batch[0]['post_id']}-{batch[-1]['post_id']} | "
                  f"Done: {processed_posts:4d}/{total_pending} ({(already_annotated+processed_posts)/(ws.max_row-1)*100:.1f}%) | "
                  f"Model: {active_model.split('-')[1]} | ETA: {eta_mins:4.1f}m | '{first_text_preview}'")

            # Checkpoint save
            if processed_posts % args.checkpoint_every == 0 or b_idx == total_batches:
                wb.save(output_path)
                data_copy = ROOT / "data/annotations/facebook_posts_annotation_ready.xlsx"
                if output_path.resolve() != data_copy.resolve():
                    wb.save(data_copy)

            if b_idx < total_batches:
                time.sleep(args.delay)

    except KeyboardInterrupt:
        print("\n\n[PAUSED] Process interrupted by user. Saving current checkpoint...")
    except Exception as e:
        print(f"\n\n[ERROR] An unexpected error occurred: {e}")
        print("Saving current progress before exit...")
    finally:
        wb.save(output_path)
        data_copy = ROOT / "data/annotations/facebook_posts_annotation_ready.xlsx"
        if output_path.resolve() != data_copy.resolve():
            wb.save(data_copy)

        total_elapsed = time.time() - start_time
        print("\n" + "=" * 75)
        print(f" BATCH ANNOTATION COMPLETE")
        print(f" Posts Processed : {processed_posts} / {total_pending}")
        print(f" Total Elapsed   : {total_elapsed/60.0:.2f} minutes")
        print(f" Saved Workbook  : {output_path}")
        print("=" * 75)

if __name__ == "__main__":
    main()
