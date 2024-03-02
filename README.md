# thisdatedoesnotexist-server

Welcome to the backend documentation of ["This Date Does Not Exist"](https://github.com/samuel-s-marques/thisdatedoesnotexist), a cutting-edge project that combines Stable Diffusion and LLM to create an AI-driven chat and matchmaking experience.

## Installation

You will need Firebase (for authentication), MySQL database, OneSignal, a Text Generation backend (Kobold or Ooobabooga), Comfy UI, and [profile-suggester](https://github.com/samuel-s-marques/thisdatedoesnotexist-profile-suggester).

Comfy UI and the Text Generation backend are both used to generate characters. To chat with them, it will also be used a LLM. 

To install and use this project, you need to follow these instructions:

1. Clone the project
```bash
git clone https://github.com/samuel-s-marques/thisdatedoesnotexist-server.git
```
2. Follow [profile-suggester](https://github.com/samuel-s-marques/thisdatedoesnotexist-profile-suggester) setup
3. Navigate to its directory
```bash
cd thisdatedoesnotexist-server
```
4. Install dependencies
```bash
npm i
```
5. Fill the `.env-example` with values and rename it to `.env`
6. Update and seed the database
```
node ace migration:fresh --seed
```
7. Start the server
```
node ace serve
```

You need to install and download [profile-suggester](https://github.com/samuel-s-marques/thisdatedoesnotexist-profile-suggester), otherwise, the characters won't like, dislike nor match the user. The user won't see the character's cards either.

## Speech to Text / Audio Messages
The project allows the users to send audio messages to characters. The audios are transcribed using WhisperCPP, locally.

If you want your users to send audio messages in the app, you need to clone [WhisperCPP](https://github.com/ggerganov/whisper.cpp) and move it to the project's root. Then, you need to download a model and put the model's name in `config/app.ts`, in the `WhisperConfig` section. After that, you need to change the `enabled` option above the `model` key.

It is this way because I have no experience or knowledge about using multimodal LLMs.

## Image Generation
This project uses [ComfyUI](https://github.com/comfyanonymous/ComfyUI) to generate character portraits, based on data coming from [character-forge - npm](https://www.npmjs.com/package/character-forge).

You need to run ComfyUI and add its URL to the `.env` file. Also, you need to put your model name in `config/app.ts`.

The project also uses:
- [LCM - LoRA](https://civitai.com/models/195519/lcm-lora-weights-stable-diffusion-acceleration-module), to generate images fast;
- [CyberRealistic_Negative](https://civitai.com/models/77976/cyberrealistic-negative) as negative embedding; 
- [Weight Slider - LoRA](https://civitai.com/models/112552/weight-slider-lora) to change the character's weight;
- [Gender Slider - LoRA](https://civitai.com/models/112988/gender-slider-lora) to change the character's gender;
- [Muscle Slider - LoRA](https://civitai.com/models/112658/muscle-slider-lora) to change the character's muscle;
- [Detail Slider - LoRA](https://civitai.com/models/153562/detail-slider-lora) to change the image's detail;
- [Breast Size Slider - LoRA](https://civitai.com/models/131864/breast-size-slider) to change the character's breast size;
- [Age Slider - LoRA](https://civitai.com/models/179792/age-slider) to change the character's age appearance;
- and [vae-ft-mse-840000](https://huggingface.co/stabilityai/sd-vae-ft-mse-original) as VAE. 

Download them.

<img src="assets/images/example.png" alt="Example character" width="200"/>

## Text Generation / Character responses
This project uses a text generation API through [Kobold](https://github.com/kalomaze/koboldcpp) or [Oobabooga](https://github.com/oobabooga/text-generation-webui) to generate character responses. 

You need to run one of them and add their URL to the `.env` file. You also need to define the API name in `config/app.ts`. Currently, the project uses `kobold` as the default API. 

You'll also need to define your prompt format in the config. The project accepts only some prompt formats, like `chatml`, `openchat`, `alpaca`, `mistral`, `user-assistant-newlines`, and `metharme`. For default, it uses `user-assistant-newlines`.

The [demo video](https://youtu.be/bp5w28hu6S8) uses `kobold` and `chatml`, with [NousResearch/Nous-Hermes-2-SOLAR-10.7B](https://huggingface.co/NousResearch/Nous-Hermes-2-SOLAR-10.7B) as the model.

## Support

If you encounter any bugs or issues, please report them in the [issue tracker](https://github.com/samuel-s-marques/thisdatedoesnotexist-server/issues).

## Related

Here are some related projects

[ThisBotDoesNotExist - procedurally generated characters powered by AI](https://github.com/samuel-s-marques/thisbotdoesnotexist)


## Authors

- **Samuel S Marques** - *Initial work* - [samuel-s-marques](https://github.com/samuel-s-marques)


## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details.
