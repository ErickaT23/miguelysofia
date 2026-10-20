const guestRows = [
 [1,"FAMILIA FLORÍAN",["HEIDY FLORIAN","ALEJANDRA RIVAS","GABRIELA MORALES","JUAN LUIS SÁNCHEZ"]],[2,"FAMILIA ÁLVAREZ FLORIÁN",["NATI FLORIAN","WALTER ALVAREZ","JIMENA ALVAREZ","ANGIE ALVAREZ"]],[3,"SULY FLORIAN",["SULY FLORIAN","DAVID GONZALEZ","WENDY FUENTES"]],[4,"FAMILIA JUAREZ FLORIÁN",["SUCELY FLORIAN","FERNANDO JUAREZ","FERNANDA JUAREZ","VALERIA JUAREZ","DOÑA MARY"]],[5,"FAMILIA LUX FLORIÁN",["TUTY FLORIAN","DANY LUX","EDGAR LUX"]],[6,"FAMILIA FLORIÁN BARCO",["JAVIER FLORIAN","AILANY FLORIAN","FATIMA CORTÉZ"]],[7,"ROSAURA BARCO",["ROSAURA BARCO"]],[8,"FAMILIA FLORIÁN ÁLVAREZ",["HENRY FLORIAN","ALEJANDRA DE FLORIAN","MATIAS FLORÍAN"]],[9,"VERONICA FLORÍAN",["VERONICA FLORÍAN","BELÉN FLORÍAN"]],[10,"VILMA BARCO",["VILMA BARCO"]],[11,"EDITH PEREIRA",["EDITH PEREIRA","HECTOR LINARES"]],[12,"LIDÍA PEREZ",["LIDÍA PEREZ"]],[13,"FAMILIA PEREIRA MARQUEZ",["LUIS PEREIRA","MIGUEL PEREIRA","WENDY DE PEREIRA","VALERIA PEREIRA"]],[14,"MACO PEREIRA",["MACO PEREIRA"]],[15,"FAMILIA VELIZ",["MARIELOS VELIZ","DULCE VELIZ","ESMERALDA VELLIZ"]],[16,"FAMILIA COLLADO",["RICARDO COLLADO","ROSY DE COLLADO"]],[17,"JOSÉ DAVID COLLADO",["JOSÉ DAVID COLLADO","LIZA DE COLLADO"]],[18,"JORGE COLLADO",["JORGE COLLADO","NICOLLE COLLADO","EVELYN DE COLLADO"]],[19,"CESAR SCHAEFFER",["CESAR SCHAEFFER","LIZZY DE SCHAEFFER"]],[20,"MAYRA DE CASTAÑEDA",["MAYRA DE CASTAÑEDA","ACOMPAÑANTE"]],[21,"DANY HERNÁNDEZ",["DANY HERNÁNDEZ","WENDY DE HERNÁNDEZ"]],[22,"RISIERI GÓMEZ",["RISIERI GÓMEZ","NANCY DE GÓMEZ"]],[23,"ADRIAN ZEPEDA",["ADRIAN ZEPEDA","MARIELOS DE ZEPEDA"]],[24,"MARIO FUENTES",["MARIO FUENTES"]],[25,"MELANIE MEJIA",["MELANIE MEJIA"]],[26,"LILIAN MEJIA",["LILIAN MEJIA"]],[27,"DIEGO BRAN",["DIEGO BRAN"]],[28,"MARITZA HERNANDEZ",["MARITZA HERNANDEZ"]],[29,"ANA HERNANDEZ",["ANA HERNANDEZ"]],[30,"TITO ORTEGA",["TITO ORTEGA","LORENA ORTEGA"]],[31,"MERY DE MORALES",["MERY DE MORALES","CRISTIAN MORALES"]],[32,"PABLO ZETINA",["PABLO ZETINA","ESPOSA DE PABLO ZETINA"]],[33,"PAOLO MOLINA",["PAOLO MOLINA"]],[34,"SEBAS MORALES",["SEBAS MORALES","ESPOSA DE SEBAS"]],[35,"AGUSTÍN FERRARA",["AGUSTÍN FERRARA"]],[36,"LUIS PINOT",["LUIS PINOT"]],[37,"ANDRÉS BOSCH",["ANDRÉS BOSCH"]],[38,"MARÍA JOSÉ JIMÉNEZ",["MARÍA JOSÉ JIMÉNEZ"]],[39,"KAREN RIOS",["KAREN RIOS","IVAN MORALES"]],[40,"PAMELA IGLESIA",["PAMELA IGLESIA"]],[41,"ERICK GRAMAJO",["ERICK GRAMAJO"]],[42,"KEVIN CORO",["KEVIN CORO","DELMI DE CORO"]],[43,"JOALDY MARROQUÍN",["JOALDY MARROQUÍN","ACOMPAÑANTE"]],[44,"JENY VELASCO",["JENY VELASCO","MAMÁ DE JENY VELASCO"]],[45,"ANDREA SALGUERO",["ANDREA SALGUERO","MAMÁ DE ANDREA BAC"]],[46,"EVELYN ALARCÓN",["EVELYN ALARCÓN","YOLI PINEDA"]],[47,"NOHEMÍ",["NOHEMÍ"]],[48,"GABRIEL RODAS",["GABRIEL RODAS"]],[49,"ARGENTINA DE ÁLVAREZ",["ARGENTINA DE ÁLVAREZ","PAPÁ DE ALE"]]
];
const nombresGrupos = [
    "Familia Florián", "Familia Álvarez Florián", "Familia Florián", "Familia Juarez Florián", "Familia Lux Florián",
    "Familia Florián Barco", "Rosaura Barco", "Familia Florián Álvarez", "Veronica Florian", "Vilma Barco",
    "Familia Linares Pereira", "Lidia Perez", "Familia Pereira Marquez", "Maco Pereira", "Familia Veliz",
    "Familia Collado", "Familia Collado Cruz", "Familia Collado Rosado", "Familia Schaeffer Collado", "Mayra de Castañeda",
    "Familia Hernández Rodríguez", "Familia Gómez", "Familia Zepeda", "Mario Fuentes", "Melanie Mejia",
    "Lilian Mejia", "Diego Bran", "Maritza Hernandez", "Ana Hernandez", "Familia Ortega",
    "Familia Morales", "Familia Zetina", "Paolo Molina", "Familia Morales", "Agustín Ferrara",
    "Luis Pinot", "Andrés Bosch", "María José Jiménez", "Familia Morales", "Pamela Iglesia",
    "Erick Gramajo", "Familia Coro", "Joaldy Marroquín", "Familia Velasco", "Familia Salguero",
    "Familia Pineda", "Nohemí Artiaga", "Gabriel Rodas", "Argentina de Álvarez"
];
guestRows.forEach(([id, nombre], index) => {
    if (nombresGrupos[index]) guestRows[index][1] = nombresGrupos[index];
});
guestRows.forEach((row) => {
    row[1] = row[1].replace(/FLOR[IÍ]AN/gi, (value) => value === value.toUpperCase() ? "FLORIÁN" : "Florián");
    row[2] = row[2].map((nombre) => nombre.replace(/FLOR[IÍ]AN/gi, (value) => value === value.toUpperCase() ? "FLORIÁN" : "Florián"));
});
const invitados = Object.fromEntries(guestRows.map(([id, nombre, miembros]) => [String(id), { nombre, pases: miembros.length, miembros: miembros.map(nombre => ({ nombre, pases: 1 })) }]));
const config = {
    invitados,
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
