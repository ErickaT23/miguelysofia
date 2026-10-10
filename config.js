const config = {
    event: {
        defaultEventId: "miguel-sofia-2026",
        eventIdParam: "eventId",
        legacyFallback: {
            read: false,
            write: false,
            subscribe: false
        }
    },

    seo: {
        titulo: "Miguel & Sofía | Boda 2026",
        descripcion: "Boda de Miguel Linares y Sofía Morales - 28 de noviembre de 2026",
        autor: "Two Design"
    },

    pareja: {
        nombres: "Miguel & Sofia",
        nombresCompletos: "Miguel Linares & Sofía Morales",
        fecha: "28-11-2026",
        fechaVisible: "28 · 11 · 2026"
    },

    musica: {
        titulo: "Nuestra Canción",
        archivo: "audio/nuestra-cancion.mp3?v=20261009-iphone-cache"
    },

    evento: {
        ceremonia: {
            titulo: "Ceremonia",
            lugar: "Jardines de San Francisco, Antigua Guatemala",
            hora: "15:30",
            direccion: "Antigua Guatemala",
            ubicacionUrl: "https://waze.com/ul/h9fx6xphhz"
        },
        recepcion: {
            titulo: "Recepción",
            lugar: "Jardines de San Francisco, Antigua Guatemala",
            hora: "15:00",
            direccion: "Antigua Guatemala",
            ubicacionUrl: "https://waze.com/ul/h9fx6xphhz"
        }
    },

    textos: {
        mensajeInvitado: "Nos hace mucha ilusión contar contigo",
        mensajePases: "Hemos reservado para ti {pases} lugares especiales"
    },

    footer: {
        hashtag: "#MiguelYSofia",
        instagramUrl: "",
        facebookUrl: "",
        marcaTexto: "Diseño",
        marcaNombre: "Two Design",
        marcaUrl: "https://twodesign.com"
    }
};

window.config = config;
