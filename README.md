# thisdatedoesnotexist-server

Welcome to the backend documentation of ["This Date Does Not Exist"](https://github.com/samuel-s-marques/thisdatedoesnotexist), a cutting-edge project that combines Stable Diffusion and LLM to create an AI-driven chat and matchmaking experience.

## Installation

You will need Firebase (for authentication), MySQL database, OneSignal, a Text Generation backend (Kobold or Ooobabooga), Comfy UI and [profile-suggester](https://github.com/samuel-s-marques/thisdatedoesnotexist-profile-suggester).

Comfy UI and the the Text Generation backend are both used to generate characters. To chat with them, it will also be used a LLM. 

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

You need to install and download [profile-suggester](https://github.com/samuel-s-marques/thisdatedoesnotexist-profile-suggester), otherwise, the characters won't like, dislike nor match the user. The user won't see the characters cards too.

## Speech to Text / Audio Messages
The project allows the users to send audio messages to characters. The audios are transcribed using WhisperCPP, locally.

If you want your users to send audio messages in the app, you need to clone [WhisperCPP](https://github.com/ggerganov/whisper.cpp) and move it project's root. Then, you need to download a model and put the model's name in `config/app.ts`, at the `WhisperConfig` section. After that, you need to change the `enabled` option above the `model` key.

It is this way because I have no experience or knowledge about using multimodal LLMs.

## Support

If you encounter any bugs or issues, please report them in the [issue tracker](https://github.com/samuel-s-marques/thisdatedoesnotexist-server/issues).

## Related

Here are some related projects

[ThisBotDoesNotExist - procedurally generated characters powered by AI](https://github.com/samuel-s-marques/thisbotdoesnotexist)


## Authors

- **Samuel S Marques** - *Initial work* - [samuel-s-marques](https://github.com/samuel-s-marques)


## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details.
