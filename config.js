const config = {
    invitados: {
        "1": { nombre: "FAMILIA FLORÍAN", pases: 4, miembros: [{ nombre: "HEIDY FLORIAN", pases: 1 }, { nombre: "ALEJANDRA RIVAS", pases: 1 }, { nombre: "GABRIELA MORALES", pases: 1 }, { nombre: "JUAN LUIS SÁNCHEZ", pases: 1 }] },
        "13": { nombre: "FAMILIA PEREIRA MARQUEZ", pases: 4, miembros: [{ nombre: "LUIS PEREIRA", pases: 1 }, { nombre: "MIGUEL PEREIRA", pases: 1 }, { nombre: "WENDY DE PEREIRA", pases: 1 }, { nombre: "VALERIA PEREIRA", pases: 1 }] },
        "15": { nombre: "FAMILIA VELIZ", pases: 3, miembros: [{ nombre: "MARIELOS VELIZ", pases: 1 }, { nombre: "DULCE VELIZ", pases: 1 }, { nombre: "ESMERALDA VELLIZ", pases: 1 }] },
        "18": { nombre: "FAMILIA PENDIENTE", pases: 3, miembros: [{ nombre: "JORGE COLLADO", pases: 1 }, { nombre: "NICOLLE COLLADO", pases: 1 }, { nombre: "EVELYN DE COLLADO", pases: 1 }] },
        "32": { nombre: "FAMILIA PENDIENTE", pases: 2, miembros: [{ nombre: "PABLO ZETINA", pases: 1 }, { nombre: "ESPOSA DE PABLO ZETINA", pases: 1 }] }
    },
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
        archivo: "audio/nuestra-cancion.mp3?v=20261012"
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
