'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Path = require('path');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    await server.register(require('@hapi/inert'));

    let musicNotes = [];

    // Rota para servir arquivos estáticos
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public',
                index: ['index.html']
            }
        }
    });

    // Rota para obter todas as notas de música em formato JSON
    server.route({
        method: 'GET',
        path: '/api/notes',
        handler: (request, h) => {
            return { data: musicNotes };
        }
    });

    // Rota para criar uma nova nota de música
    server.route({
        method: 'POST',
        path: '/api/notes',
        handler: (request, h) => {
            const { title, artist, description, composer, album } = request.payload;
            const newNote = {
                id: musicNotes.length + 1,
                title,
                artist,
                description: description || 'Sem descrição',
                composer,
                album
            };

            musicNotes.push(newNote);

            return h.response(newNote).code(201);
        },
        options: {
            validate: {
                payload: Joi.object({
                    title: Joi.string().required(),
                    artist: Joi.string().required(),
                    description: Joi.string().optional(),
                    composer: Joi.string().required(),
                    album: Joi.string().required()
                })
            }
        }
    });

    // Rota para atualizar uma nota de música pelo ID
    server.route({
        method: 'PUT',
        path: '/api/notes/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            const { title, artist, description, composer, album } = request.payload;
            const noteIndex = musicNotes.findIndex(note => note.id === parseInt(id));

            if (noteIndex !== -1) {
                musicNotes[noteIndex] = {
                    ...musicNotes[noteIndex],
                    title: title || musicNotes[noteIndex].title,
                    artist: artist || musicNotes[noteIndex].artist,
                    description: description || musicNotes[noteIndex].description,
                    composer: composer || musicNotes[noteIndex].composer,
                    album: album || musicNotes[noteIndex].album
                };

                return { data: musicNotes[noteIndex] };
            } else {
                return h.response({ error: 'Nota não encontrada' }).code(404);
            }
        },
        options: {
            validate: {
                payload: Joi.object({
                    title: Joi.string().optional(),
                    artist: Joi.string().optional(),
                    description: Joi.string().optional(),
                    composer: Joi.string().optional(),
                    album: Joi.string().optional()
                })
            }
        }
    });

    // Rota para deletar uma nota de música pelo ID
    server.route({
        method: 'DELETE',
        path: '/api/notes/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            const noteIndex = musicNotes.findIndex(note => note.id === parseInt(id));

            if (noteIndex !== -1) {
                musicNotes.splice(noteIndex, 1);
                return { message: `Nota com ID ${id} deletada com sucesso!` };
            } else {
                return h.response({ error: 'Nota não encontrada' }).code(404);
            }
        }
    });

    await server.start();
    console.log('Servidor rodando em:', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
