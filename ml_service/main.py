# pip install transformers optimum onnx
import warnings
warnings.filterwarnings("ignore", message=".*torch_dtype.*deprecated.*")
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from optimum.onnxruntime import ORTModelForSequenceClassification
from pathlib import Path

model_id = "nlptown/bert-base-multilingual-uncased-sentiment" # Pre-trained sentiment model

# 1. Load the pre-trained NLP model
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = ORTModelForSequenceClassification.from_pretrained(model_id, export=True, dtype="auto")

# 2. (Optional) Fine-tune the model here using your CSV dataset of airline reviews

# 3. Export to ONNX format for C#
save_directory = Path("onnx_model_output")
model.save_pretrained(save_directory)
tokenizer.save_pretrained(save_directory)

print("Exported to ONNX! Move the model.onnx file to your CleanArchitecture.WebApi folder.")