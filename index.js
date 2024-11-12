const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

// Obtener todos los participantes (GET)
app.get('/participantes', (req, res) => {
    try {
        // Leer archivo JSON de participantes
        let participantesData = fs.readFileSync("Participante.json", "utf8");
        let participantes = JSON.parse(participantesData).Participantes;

        // Leer el archivo JSON de actividades
        let actividadesData = fs.readFileSync("Actividades.json", "utf8");
        let actividades = JSON.parse(actividadesData).actividades;

        // Mapear la lista de participantes para agregar solo las actividades a las que están inscriptos
        const participantesConEstado = participantes.map(participante => {
            // Filtrar solo las actividades en las que el participante está inscripto
            const ParticipantesInscriptos = actividades.filter(actividad => 
                actividad.Participantes && actividad.Participantes.some(p => p.dni === participante.dni)
            ).map(actividad => ({
                idActividad: actividad.idActividad,
                nombreActividad: actividad.nombreActividad,
                inscrito: true
            }));

            // Si el participante no está inscripto en ninguna actividad, se agrega inscripto: false
            if (ParticipantesInscriptos.length === 0) {
                return {
                    ...participante,
                    inscripto: false, 
                    ParticipantesInscriptos: []  //se asegura de que no haya actividades
                };
            }

            // Si está inscripto en alguna actividad, devolver las actividades en las que está inscripto
            return {
                ...participante,
                inscripto: true, 
                ParticipantesInscriptos: ParticipantesInscriptos
            };
        });

        // Enviar la lista de participantes con su estado de inscripción
        res.status(200).json(participantesConEstado);
    } catch (error) {
        console.error("Error al procesar los archivos:", error);
        res.status(500).json({ mensaje: "Error al procesar los archivos." });
    }
});

app.get("/participantes/:dni", (req, res) => {
    const dni = req.params.dni;

        // Leer y parsear el archivo JSON
        let Participante = fs.readFileSync("Participante.json", "utf8");
        Participante = JSON.parse(Participante);
        const participantes= Participante.Participantes.find(act => act.dni === dni);

        if (participantes) {  
        res.send(participantes);
        } else {
        res.status(404).send({ message: "Actividad no encontrada" });
        }

});


// Registro de usuario (POST)
app.post("/registroParticipante", (req, res) => {
    const { nombre, direccion, edad, dni } = req.body;
    try {
        // Leer archivo Participante.json
        let Participante = fs.readFileSync("Participante.json");
        Participante = JSON.parse(Participante);

        // Buscar si el participante ya existe
        const participanteExistente = Participante.Participantes.find(usuario => usuario.dni === dni);

        if (participanteExistente) {
            res.status(400).send({ mensaje: "El usuario ya está registrado." });
        } else {
            // Agregar nuevo participante
            const nuevoParticipante = { nombre, direccion, edad, dni, };
            Participante.Participantes.push(nuevoParticipante);

            // Guardar el archivo JSON actualizado
            fs.writeFileSync("Participante.json", JSON.stringify(Participante, null, 2));
            res.send({ mensaje: "Participante registrado exitosamente.", participante: nuevoParticipante });
        }
    } catch (error) {
        res.status(500).send({ mensaje: "Error al procesar el archivo de participante." });
    }
});





app.delete("/eliminarParticipante/:dni", (req, res) => {
    const dni = req.params.dni;

        // Leer y parsear el archivo JSON de participantes
        let Participantes = fs.readFileSync("Participante.json", "utf8");
        Participantes = JSON.parse(Participantes);

        // Buscar el índice del participante con el DNI dado
        const participanteIndex = Participantes.Participantes.findIndex(participante => participante.dni === dni);

        if (participanteIndex !== -1) {
            // Eliminar al participante del array
            Participantes.Participantes.splice(participanteIndex, 1);

            // Guardar los cambios en el archivo JSON
            fs.writeFileSync("Participante.json", JSON.stringify(Participantes, null, 2));

            res.send({ mensaje: "Participante eliminado exitosamente." });
        } else {
            res.status(404).send({ mensaje: "Participante no encontrado." });
        }
});

// Actualizar un participante (Estado)
app.delete("/estadoParticipante", (req, res) => {
    let dni = req.params.dni;

    try {
        // Leer y parsear el archivo JSON
        let data = fs.readFileSync("Participante.json", 'utf8');
        let Participante = JSON.parse(data);

        // Verificar si la estructura contiene 'Participantes'
        if (!Participante.Participantes) {
            return res.status(500).send({ mensaje: "Error: No se encontró la lista de participantes en el archivo." });
        }

        // Filtrar los participantes para eliminar el que coincide con el DNI
        const participantesActualizados = Participante.Participantes.filter(participante => participante.dni !== dni);

        // Verificar si hubo cambios
        if (participantesActualizados.length === Participante.Participantes.length) {
            return res.status(404).send({ mensaje: "Participante no encontrado." });
        }

        // Actualizar la lista de participantes
        Participante.Participantes = participantesActualizados;

        // Guardar los cambios en el archivo JSON
        fs.writeFileSync("Participante.json", JSON.stringify(Participante, null, 2));

        res.send({ mensaje: "Participante Actualizado exitosamente." });
    } catch (error) {
        console.error(error); // Imprimir el error en el servidor
        res.status(500).send({ mensaje: "Error al procesar el archivo." });
    }
});

app.get('/actividades', (req, res) => {
    try {
        let actividades = fs.readFileSync("Actividades.json");
        res.send(JSON.parse(actividades));
    } catch (error) {
        res.status(500).send({ mensaje: "Error al leer el archivo de participantes." });
    }
});
app.get("/actividades/:idActividad", (req, res) => {
    const idActividad = req.params.idActividad;

        // Leer y parsear el archivo JSON
        let actividades = fs.readFileSync("Actividades.json", "utf8");
        actividades = JSON.parse(actividades);
        const actividad = actividades.actividades.find(act => act.idActividad === idActividad);

        if (actividad) {
        res.send(actividad);
        } else {
        res.status(404).send({ message: "Actividad no encontrada" });
        }

});
app.post("/crearActividad", (req, res) => {
    const { idActividad, nombreActividad, fecha } = req.body;

    try {
        // Leer el archivo JSON
        let Actividades = fs.readFileSync("Actividades.json", "utf8");
        Actividades = JSON.parse(Actividades);

        // Verificar si la actividad ya existe
        const actividadExistente = Actividades.actividades.find(actividad => actividad.idActividad === idActividad);

        if (actividadExistente) {
            res.status(400).send({ mensaje: "La actividad ya existe." });
        } else {
            // Crear la nueva actividad
            const nuevaActividad = { idActividad, nombreActividad, fecha };
            Actividades.actividades.push(nuevaActividad);

            // Guardar el archivo actualizado
            fs.writeFileSync("Actividades.json", JSON.stringify(Actividades, null, 2));

            // Enviar respuesta de éxito
            res.send({ mensaje: "Actividad creada exitosamente.", actividad: nuevaActividad });
        }
        
    } catch (error) {
        res.status(500).send({ mensaje: "Error al procesar la solicitud.", error: error.message });
    }
});
// Modificar una actividad existente (PUT)
app.put("/modificarActividad/:idActividad", (req, res) => {
    let idActividad = req.params.idActividad;
    const { nombreActividad, fecha, cuposDisponibles } = req.body; // Recibe los nuevos datos desde el cuerpo de la solicitud

    try {
        // Leer el archivo JSON
        let actividades = fs.readFileSync("Actividades.json");
        actividades = JSON.parse(actividades);

        // Buscar la actividad por su ID
        const actividad = actividades.actividades.find(actividad => actividad.idActividad === idActividad);

        if (actividad) {
            // Modificar  la actividad
            if (nombreActividad) {
                actividad.nombreActividad = nombreActividad;
            }
            if (fecha) {
                actividad.fecha = fecha;
            }
            if (cuposDisponibles) {
                actividad.cuposDisponibles = cuposDisponibles;
            }

            // Guardar los cambios en el JSON
            fs.writeFileSync("Actividades.json", JSON.stringify(actividades, null, 2));

            return res.status(200).json({ message: "Actividad modificada correctamente", actividad });
        } else {
            return res.status(404).json({ message: "Actividad no encontrada" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error al procesar la solicitud", error: error.message });
    }
});// Eliminar una actividad (DELETE)
app.delete("/eliminarActividad/:idActividad", (req, res) => {
    let idActividad = req.params.idActividad;

    try {
        let actividades = fs.readFileSync("Actividades.json");
        actividades = JSON.parse(actividades);

        const actividadIndex = actividades.actividades.findIndex(actividad => actividad.idActividad === idActividad);

        if (actividadIndex !== -1) {
            actividades.actividades.splice(actividadIndex, 1);
            fs.writeFileSync("Actividades.json", JSON.stringify(actividades, null, 2));
            res.send({ mensaje: "Actividad eliminada exitosamente." });
        } else {
            res.status(404).send({ mensaje: "Actividad no encontrada." });
        }
    } catch (error) {
        res.status(500).send({ mensaje: "Error al procesar el archivo de actividades." });
    }
});
app.put("/modificarParticipante/:dni", (req, res) => {
    let dni = req.params.dni;
    let nuevaEdad = req.body.edad;

    // Leer y  el archivo JSON
    let data = fs.readFileSync("Participante.json", "utf8");
    let Participantes = JSON.parse(data);

    // Buscar el participante por su dni
    const participante = Participantes.Participantes.find(participante => participante.dni === dni);

    if (!participante) {
        return res.status(404).json({ message: "Participante no encontrado" });
    }

    // Modificar la edad del participante
    participante.edad = nuevaEdad;

    // Guardar los cambios en el archivo JSON
    fs.writeFileSync("Participante.json", JSON.stringify(Participantes, null, 2), "utf8");

    return res.status(200).json({ message: "Participante modificado correctamente", participante });
});

app.post("/inscribirParticipante", (req, res) => {
    try {
        // recibir el DNI del participante y el ID de la actividad desde el cuerpo de la solicitud
        let dni = req.body.dni;
        let idActividad = req.body.idActividad;

        // Leer y parsear los archivos JSON
        let ParticipantesData = fs.readFileSync("Participante.json", "utf8");
        let actividadesData = fs.readFileSync("Actividades.json", "utf8");

        let parsedParticipantesData = JSON.parse(ParticipantesData);
        let parsedActividadesData = JSON.parse(actividadesData);

        // se verifica que las propiedades "Participantes" y "actividades" existan y sean arreglos
        let Participantes = Array.isArray(parsedParticipantesData.Participantes) ? parsedParticipantesData.Participantes : [];
        let actividades = Array.isArray(parsedActividadesData.actividades) ? parsedActividadesData.actividades : [];

        // Buscar el participante por su DNI
        const participante = Participantes.find(p => p.dni === dni);
        if (!participante) {
            return res.status(404).json({ message: "Participante no encontrado" });
        }

        // Buscar la actividad por su ID de actividad
        const actividad = actividades.find(a => String(a.idActividad) === String(idActividad));
        if (!actividad) {
            return res.status(404).json({ message: "Actividad no encontrada" });
        }

        // Verificar si el participante ya está inscripto en la actividad
        if (!Array.isArray(actividad.Participantes)) actividad.Participantes = []; // Inicializar si es undefined
        const yaInscrito = actividad.Participantes.some(p => p.dni === dni);
        if (yaInscrito) {
            return res.status(400).json({ message: "El participante ya está inscrito en esta actividad" });
        }

        // Inscribir al participante en la actividad
        actividad.Participantes.push({
            dni: participante.dni,
            nombre: participante.nombre,
            edad: participante.edad
        });

        actividad.cuposDisponibles -=1;

        // Guardar los cambios en el archivo de actividades
        fs.writeFileSync("Actividades.json", JSON.stringify({ actividades: actividades }, null, 2), "utf8");

        return res.status(200).json({ message: "Participante inscrito correctamente", actividad });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
app.delete("/eliminarParticipante/:idActividad/:dni", (req, res) => {
    const { dni, idActividad } = req.params;    
        try {
            // Leer y parsear el archivo JSON de actividades
            let actividadesData = fs.readFileSync("Actividades.json", "utf8");
            let parsedActividadesData = JSON.parse(actividadesData);
    
            // Verificar que la propiedad "actividades" exista y sea un arreglo
            let actividades = Array.isArray(parsedActividadesData.actividades) ? parsedActividadesData.actividades : [];
    
            // Buscar la actividad por su ID
            const actividad = actividades.find(a => String(a.idActividad) === String(idActividad));
            if (!actividad) {
                return res.status(404).json({ mensaje: "Actividad no encontrada." });
            }
    
            // Asegurarse de que "actividad.Participantes" es un array; inicializar si no existe
            if (!Array.isArray(actividad.Participantes)) {
                actividad.Participantes = []; // Inicializar como arreglo vacío si está undefined
            }
    
            const participanteIndex = actividad.Participantes.findIndex(p => p.dni === dni);
            if (participanteIndex === -1) {
                return res.status(404).json({ mensaje: "Participante no encontrado en la actividad." });
            }
    
            // Eliminar al participante de la actividad
            actividad.Participantes.splice(participanteIndex, 1);
    
            // Restaurar el cupo disponible después de borrar al participante
            if (typeof actividad.cuposDisponibles === "number") {
                actividad.cuposDisponibles += 1;
            } else {
                actividad.cuposDisponibles = 12;
            }
    
            // Guardar los cambios en el archivo JSON de actividades
            fs.writeFileSync("Actividades.json", JSON.stringify({ actividades }, null, 2), "utf8");
    
            return res.status(200).json({ mensaje: "Participante eliminado exitosamente de la actividad y cupo restaurado.", actividad });
        } catch (error) {
            console.error("Error al procesar el archivo de actividades:", error);
            return res.status(500).json({ mensaje: "Error al procesar el archivo de actividades." });
        }
    });
// Configuración del puerto
const port = 8080;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
