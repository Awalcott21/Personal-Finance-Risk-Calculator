# src/preprocess.py
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer

def build_preprocessor(numeric_features):
    num_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipe, numeric_features),
        ],
        remainder="drop",
    )
    return preprocessor
