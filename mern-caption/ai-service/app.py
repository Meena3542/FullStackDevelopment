from flask import Flask, request, jsonify
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

app = Flask(__name__)           #creates the Flask web application/server.

# converts image → machine understandable format
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")

#This loads the pretrained BLIP(Bootstrapping Language-Image Pre-training) captioning model.
#The model already knows how to describe images because it was trained on millions of images and captions.
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.route("/caption", methods=["POST"])        #Because user sends an image file to the server
def caption():
    file = request.files["image"]
    image = Image.open(file).convert("RGB")

    inputs = processor(image, return_tensors="pt")      #This converts image into tensors
    output = model.generate(**inputs)

    caption = processor.decode(output[0], skip_special_tokens=True)

    return jsonify({"caption": caption})

if __name__ == "__main__":
    app.run(port=8000)


"""
User uploads image
        ↓
Flask receives image
        ↓
PIL opens image
        ↓
BLIP Processor converts image → tensors
        ↓
BLIP Model analyzes image
        ↓
Model generates caption
        ↓
Caption decoded into text
        ↓
JSON response returned

"""