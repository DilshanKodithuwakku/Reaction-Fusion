import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import hstack

class TextFeatureExtractor:
    """
    Stage A Text Encoder: Reproducible TF-IDF + SVD Baseline.
    Crucially, fit() must only be called on the Training Split to prevent data leakage.
    Character n-grams are included to tolerate Sinhala misspellings and slang.
    """
    def __init__(self, n_components=256):
        self.n_components = n_components
        
        # Word-level semantics
        self.word_vec = TfidfVectorizer(
            analyzer='word', 
            ngram_range=(1, 2), 
            max_features=3000
        )
        
        # Character-level morphology (robust to slang/misspellings)
        self.char_vec = TfidfVectorizer(
            analyzer='char', 
            ngram_range=(3, 5), 
            max_features=5000
        )
        
        # Dimensionality reduction
        self.svd = TruncatedSVD(
            n_components=self.n_components, 
            random_state=42
        )
        
    def fit(self, texts: pd.Series):
        """
        Fits TF-IDF and SVD strictly on training texts.
        """
        # 1. Fit & transform TF-IDF
        X_w = self.word_vec.fit_transform(texts)
        X_c = self.char_vec.fit_transform(texts)
        
        X_sparse = hstack([X_w, X_c])
        
        # 2. Fit SVD on the combined sparse matrix
        self.svd.fit(X_sparse)
        return self
        
    def transform(self, texts: pd.Series) -> np.ndarray:
        """
        Transforms texts using the strictly fitted vocabularies and components.
        """
        # 1. Transform TF-IDF
        X_w = self.word_vec.transform(texts)
        X_c = self.char_vec.transform(texts)
        
        X_sparse = hstack([X_w, X_c])
        
        # 2. Transform SVD
        return self.svd.transform(X_sparse)
        
    def fit_transform(self, texts: pd.Series) -> np.ndarray:
        return self.fit(texts).transform(texts)
