import gradio as gr
from fastai.vision.all import *
import skimage
import pathlib
import pandas as pd

# Load the model
plt = platform.system()
if plt == 'Linux': pathlib.WindowsPath = pathlib.PosixPath
title = "Face condition Analyzer"
description = "A face condition detector trained on the custom dataset with fastai. Created using Gradio and HuggingFace Spaces."
examples = [['harmonal_acne.jpg'],['forehead_wrinkles.jpg'],['oily_skin.jpg']]
enable_queue=True

with gr.Blocks(title=title,description=description,examples=examples,enable_queue=enable_queue) as demo:
    learn = load_learner('export.pkl')
    labels = learn.dls.vocab
    def predict(img):
        img = PILImage.create(img)
        pred,pred_idx,probs = learn.predict(img)
        return {labels[i]: float(probs[i]) for i in range(len(labels))}
    gr.Markdown("# Face Skin Analyzer")
    gr.Markdown("A face condition detector trained on the custom dataset with fastai. Created using Gradio and HuggingFace Spaces. Kindly upload a photo of your face.")
    with gr.Row():
        inputs = gr.inputs.Image(shape=(512, 512))
        outputs = gr.outputs.Label(num_top_classes=3)
    btn = gr.Button("Predict")
    btn.click(fn=predict, inputs=inputs, outputs=outputs)
    
    df=pd.read_excel("recommendation.xlsx")
    classes = df['class'].unique()
    with gr.Accordion("Find your skin condition using above analyzer and see the Recommended solutions",open=True):
        for c in classes:
            with gr.Accordion(c,open=False):
                df_temp = df[df['class']==c]
                with gr.Row():
                    for i,current_row in df_temp.iterrows():
                        with gr.Column():
                            html_box = gr.HTML("<a href='{}'><img src ='{}'></a>".format(current_row['profit_link'],current_row['product_image']))                   
demo.launch()