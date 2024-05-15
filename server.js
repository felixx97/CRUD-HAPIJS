'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi'); // Para validação de entrada

const init = async () => {
    const server = Hapi.Server({
        port: 3000,
        host: 'localhost'
    });

    // Array para armazenar as notas de música (simulação temporária)
    let musicNotes = [];

    // Rota para a página inicial (home)
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return '<h1>Bloco de Notas de Música</h1><p>Esta é a página inicial do Bloco de Notas de Música.</p>';
        }
    });

    // Rota para obter todas as notas de música
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

            // Verifica se os campos obrigatórios estão presentes e não estão em branco
            if (!title || !artist || !composer || !album) {
                const missingFields = [];
                if (!title) missingFields.push('title');
                if (!artist) missingFields.push('artist');
                if (!composer) missingFields.push('composer');
                if (!album) missingFields.push('album');

                return h.response({
                    error: 'Campos obrigatórios não preenchidos ou em branco',
                    missingFields
                }).code(400);
            }

            // Se a descrição não estiver presente, utiliza o valor padrão "Sem descrição"
            const newDescription = description || 'Sem descrição';

            const newNote = {
                id: musicNotes.length + 1,
                title,
                artist,
                description: newDescription,
                composer,
                album
            };

            musicNotes.push(newNote);
            return { message: 'Nota de música criada com sucesso!', data: newNote };
        },
        options: {
            validate: {
                payload: Joi.object({
                    title: Joi.string().required(),
                    artist: Joi.string().required(),
                    description: Joi.string(),
                    composer: Joi.string().required(),
                    album: Joi.string().required()
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
            const index = musicNotes.findIndex(note => note.id === parseInt(id));
            if (index !== -1) {
                musicNotes.splice(index, 1);
                return { message: `Nota de música com ID ${id} deletada com sucesso!` };
            } else {
                return { message: `Nota de música com ID ${id} não encontrada!` };
            }
        }
    });

    // Inicia o servidor
    await server.start();
    console.log('Servidor Hapi.js rodando em:', server.info.uri);
};

// Captura erros não tratados e encerra o processo
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Chama a função de inicialização
init();
