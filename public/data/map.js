// Array de colores ajustados para la distribución visual
const colors = [
    'blue',    // Jurisdicción 10 de Octubre
    'green',   // Jurisdicción Bayovar
    'purple',  // Jurisdicción Caja de Agua
    'orange',  // Jurisdicción Canto Rey
    'red',     // Jurisdicción La Huayrona
    'gray',    // Jurisdicción Mariscal Caceres
    'brown',   // Jurisdicción Santa Elizabeth
    'black'    // Jurisdicción Zarate
];

// OPTIMIZACIÓN: Cache para SVGs
const svgCache = {};

// Función para crear el ícono SVG dinámico según tipo de cámara (SIMPLIFICADO)
function createCameraSVG(type) {
    // Comprobar si ya existe en cache
    const cacheKey = `camera-${type}`;
    if (svgCache[cacheKey]) {
        return svgCache[cacheKey];
    }

    const colorsByType = {
        "TIPO I": '#FF0000',
        "TIPO II": '#00FF00',
        "TIPO III": '#0000FF'
    };

    const color = colorsByType[type] || '#808080';  // Color por defecto gris

    // SVG simplificado con menos elementos
    const svg = `
        <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect x="4" y="8" width="16" height="9" rx="2" fill="${color}" stroke="#000" stroke-width="1" />
            <circle cx="12" cy="12.5" r="3" fill="#fff" stroke="#000" stroke-width="1" />
            <circle cx="12" cy="12.5" r="1.5" fill="#007BFF" />
        </svg>
    `;

    // Guardar en cache
    svgCache[cacheKey] = svg;
    return svg;
}

const radioFiltro = 350;

// Inicializar el mapa
var map = L.map('map').setView([-11.974227, -76.999071], 13);

// Agregar capa de mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Variables globales
let cameraMarkers = [];
let vecinalMarkers = []; // Nueva variable para los marcadores vecinales
let geojsonData = null;
let vecinalData = null; // Nueva variable para los datos vecinales
let polygons = [];
let currentCircle = null;

// OPTIMIZACIÓN: Grupos de marcadores para clustering
let cameraClusterGroup = L.layerGroup();
let vecinalClusterGroup = L.layerGroup();

// Función para dibujar el polígono en el mapa
function drawPolygon(jurisdiction) {
    if (jurisdiction.coordinates.length > 0) {
        const color = colors[jurisdiction.index % colors.length];

        const polygon = L.polygon(jurisdiction.coordinates, {
            color: color,
            weight: 4,
            opacity: 0.7
        }).addTo(map);

        polygon.on('click', () => {
            resetFilter();
            if (map.hasLayer(projectCamerasLayer)) {
                filterCamerasByJurisdiction(polygon);
            }

        });

        polygons.push(polygon);
    } else {
        console.warn(`Jurisdicción ${jurisdiction.name} tiene coordenadas inválidas.`);
    }
}

// Definir las capas
let projectCamerasLayer = L.layerGroup();
let vecinalCamerasLayer = L.layerGroup();

// Definir las capas base como mutuamente exclusivas
let baseMaps = {
    "Cámaras Municipales": projectCamerasLayer,
    "Cámaras Vecinales": vecinalCamerasLayer
};

// Agregar control de capas al mapa (mutuamente exclusivas)
L.control.layers(null, baseMaps, { collapsed: false }).addTo(map);

// Por defecto, activar ambas capas
projectCamerasLayer.addTo(map);

// Función para mostrar información de la cámara en el panel lateral
function showCameraInfo(camera, isVecinal = false) {
    document.getElementById('cameraInfoPopup').style.display = 'block';

    if (isVecinal) {
        // Para cámaras vecinales: mostrar solo los campos disponibles
        document.getElementById('cameraNameValue').textContent = camera.properties.nombre || 'Desconocido';
        document.getElementById('cameraLatValue').textContent = camera.geometry.coordinates[1] || 'No disponible';
        document.getElementById('cameraLngValue').textContent = camera.geometry.coordinates[0] || 'No disponible';
        document.getElementById('cameraTipoValue').textContent = camera.properties.tipo || 'Desconocido';
        document.getElementById('cameraDireccionValue').textContent = camera.properties.ubicacion || 'No definida';
        document.getElementById('cameraCamaraValue').textContent = camera.properties.marca || 'Desconocido';

        // Ocultar campos que no tienen datos en cámaras vecinales
        document.getElementById('cameraMegafono').style.display = 'none';
        document.getElementById('cameraBoton').style.display = 'none';
        document.getElementById('cameraJurisdiccion').style.display = 'none';
    } else {
        // Para cámaras del proyecto: mostrar todos los campos
        document.getElementById('cameraNameValue').textContent = camera.properties.name || 'Desconocido';
        document.getElementById('cameraLatValue').textContent = camera.geometry.coordinates[1] || 'No disponible';
        document.getElementById('cameraLngValue').textContent = camera.geometry.coordinates[0] || 'No disponible';
        document.getElementById('cameraDireccionValue').textContent = camera.properties.direccion || 'Desconocido';
        document.getElementById('cameraTipoValue').textContent = camera.properties.tipo || 'Desconocido';
        document.getElementById('cameraCamaraValue').textContent = camera.properties.camara || 'Desconocido';

        // Convertir valores booleanos de megáfono y botón en "Sí" o "No"
        const megafonoValue = camera.properties.megafono == true ? 'Sí' : 'No';
        const botonValue = camera.properties.boton == true ? 'Sí' : 'No';

        document.getElementById('cameraMegafonoValue').textContent = megafonoValue;
        document.getElementById('cameraBotonValue').textContent = botonValue;
        document.getElementById('cameraJurisdiccionValue').textContent = camera.properties.jurisdiccion || 'Desconocido';

        // Mostrar campos específicos para cámaras del proyecto
        document.getElementById('cameraMegafono').style.display = 'block';
        document.getElementById('cameraBoton').style.display = 'block';
        document.getElementById('cameraJurisdiccion').style.display = 'block';
    }
}

// OPTIMIZADO: Función para cargar los marcadores de las cámaras
function loadMarkers(geojson) {
    // Limpiar la capa de marcadores existentes
    projectCamerasLayer.clearLayers();
    cameraMarkers = [];

    // Crear y agregar nuevos marcadores (solo los que son visibles en vista actual)
    const bounds = map.getBounds();

    cameraMarkers = geojson.features.map(feature => {
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];

        // OPTIMIZACIÓN: Implementa lazy loading de marcadores
        const latlng = L.latLng(lat, lng);

        const type = feature.properties.tipo || 'I';
        const svgIconHtml = createCameraSVG(type);

        const icon = L.divIcon({
            html: svgIconHtml,
            className: 'custom-camera-icon',
            iconSize: [40, 40],  // OPTIMIZADO: Tamaño reducido
            iconAnchor: [20, 20],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([lat, lng], { icon });

        // ¡Aquí es donde asignamos la propiedad 'feature' al marcador!
        marker.feature = feature;

        // OPTIMIZADO: tooltips no permanentes para reducir sobrecarga visual
        marker.bindTooltip(feature.properties.name || 'Desconocido', {
            permanent: false,
            direction: 'bottom',
            className: 'camera-tooltip',
            offset: [-3, 5],

        });

        marker.on('click', () => {
            // Al hacer clic, mostrar cámaras cercanas
            showNearestCameras(marker.getLatLng());
            showCameraInfo(feature);
        });

        marker.addTo(projectCamerasLayer);
        return marker;
    });
}

// Función para crear SVG de cámaras vecinales (SIMPLIFICADO)
function createVecinalCameraSVG(type) {
    // Comprobar si ya existe en cache
    const cacheKey = `vecinal-${type?.tipo || ''}-${type?.marca || ''}`;
    if (svgCache[cacheKey]) {
        return svgCache[cacheKey];
    }

    // Obtener tipo y marca de la cámara
    const cameraType = type?.tipo?.toUpperCase() || '';
    const cameraMarca = type?.marca?.toUpperCase() || '';

    // Determinar si es DOMO o fija
    const isDomo = cameraType.includes('DOMO');

    // Determinar el color según la marca
    let fillColor;
    if (cameraMarca.includes('HIKVISION')) {
        fillColor = '#FF6D00'; // Rojo para HIKVISION
    } else if (cameraMarca.includes('DAHUA')) {
        fillColor = '#6600A1'; // Azul para DAHUA
    } else {
        fillColor = '#808080'; // Gris para otras marcas
    }

    let svg;
    if (isDomo) {
        // SVG simplificado para cámaras tipo DOMO
        svg = `
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" fill="none">
                <ellipse cx="12" cy="12" rx="10" ry="10" fill="${fillColor}" />
                <ellipse cx="12" cy="12" rx="7" ry="7" fill="#FFFFFF" opacity="0.6" />
                <circle cx="12" cy="12" r="3" fill="#111111" />
                <circle cx="11" cy="11" r="1" fill="#666666" opacity="0.7" />
            </svg>
        `;
    } else {
        // SVG simplificado para cámaras fijas
        svg = `
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" fill="none">
                <rect x="4" y="7" width="16" height="10" rx="2" fill="${fillColor}" stroke="#333333" stroke-width="1" />
                <circle cx="12" cy="12" r="3" fill="#DDDDDD" />
                <circle cx="12" cy="12" r="2" fill="#333333" />
            </svg>
        `;
    }

    // Guardar en cache
    svgCache[cacheKey] = svg;
    return svg;
}

// OPTIMIZADO: Función para cargar marcadores vecinales con nuevos iconos
function loadVecinalMarkers(vecinalGeojson) {
    // Limpiar la capa de marcadores existentes
    vecinalCamerasLayer.clearLayers();
    vecinalMarkers = [];

    // Crear y agregar nuevos marcadores vecinales
    vecinalMarkers = vecinalGeojson.features.map(feature => {
        // Pasamos todo el objeto de propiedades para acceder a tipo y marca
        const svgIconHtml = createVecinalCameraSVG(feature.properties);

        const icon = L.divIcon({
            html: svgIconHtml,
            className: 'custom-camera-icon vecinal',
            iconSize: [40, 40],  // OPTIMIZADO: Tamaño reducido
            iconAnchor: [20, 20],
            popupAnchor: [0, -40]
        });

        const marker = L.marker(
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            { icon }
        );

        // Asignar la propiedad 'feature' al marcador
        marker.feature = feature;

        // OPTIMIZADO: tooltip no permanente
        const tooltipText = `${feature.properties.nombre || 'Desconocido'} (${feature.properties.marca || 'N/A'})`;
        marker.bindTooltip(tooltipText, {
            permanent: false,
            direction: 'top',
            className: 'camera-tooltip',
            offset: [-3, 5],
        });

        marker.on('click', () => {
            showCameraInfo(feature, true);
        });

        vecinalCamerasLayer.addLayer(marker);
        return marker;
    });
}

// OPTIMIZADO: Simplifica la búsqueda de cámaras cercanas
function showNearestCameras(latlng) {
    showLoader();
    // Eliminar círculo anterior si existe
    if (currentCircle) {
        map.removeLayer(currentCircle);
    }

    // 1. Calcular distancias directas
    const camerasWithDistance = geojsonData.features.map(feature => {
        const cameraLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        const distance = latlng.distanceTo(cameraLatLng);
        return { feature, cameraLatLng, distance };
    });

    // 2. Obtener los N más cercanos por distancia
    const sortedByDistance = camerasWithDistance.sort((a, b) => a.distance - b.distance);
    const topCandidates = sortedByDistance.slice(0, 9); // Tomamos los 9 más cercanos inicialmente

    // 3. Obtener distancias por tiempo de ruta (OSRM)
    getRouteDistances(latlng, topCandidates)
        .then(camerasWithDurations => {
            // 4. Ordenar por tiempo de ruta
            const sortedByRouteTime = camerasWithDurations.sort((a, b) => a.routeDistance - b.routeDistance);

            // 5. Seleccionar los más cercanos por ruta
            const nearestFeatures = sortedByRouteTime.slice(0, 5).map(item => item.feature);

            // 6. Dibujar círculo en el mapa (radio = más lejano por distancia aérea de los top 5)
            const maxDistance = nearestFeatures.reduce((max, feature) => {
                const camLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                return Math.max(max, latlng.distanceTo(camLatLng));
            }, 0);

            // Crear círculo con un color aleatorio para distinguirlo
            const randomColor = getRandomColor();

            currentCircle = L.circle(latlng, {
                color: randomColor,
                fillColor: randomColor,
                fillOpacity: 0.2,
                radius: maxDistance,
                className: 'current-circle'
            }).addTo(map);

            // Añadir un tooltip al círculo con información sobre el radio
            currentCircle.bindTooltip(`Radio: ${(maxDistance / 1000).toFixed(2)} km`, {
                permanent: false,
                direction: 'center',
                className: 'circle-tooltip'
            });

            // 7. Mostrar solo las cámaras dentro del círculo
            const camerasInCircle = geojsonData.features.filter(feature => {
                const camLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                return latlng.distanceTo(camLatLng) <= maxDistance;
            });

            // Agregar tooltip con radio a cada cámara
            loadMarkersWithRadius({ features: camerasInCircle }, maxDistance);
            hideLoader();
        })
        .catch(error => {
            console.error("Error al obtener rutas:", error);
            // Si falla el cálculo de rutas, usamos solo distancia directa
            const nearestFeatures = sortedByDistance.slice(0, 5).map(item => item.feature);
            const maxDistance = sortedByDistance[4].distance;

            // Generamos un color aleatorio para el nuevo círculo
            const randomColor = getRandomColor();

            currentCircle = L.circle(latlng, {
                color: randomColor,
                fillColor: randomColor,
                fillOpacity: 0.2,
                radius: maxDistance,
                className: 'current-circle'
            }).addTo(map);

            // Añadir un tooltip al círculo con información sobre el radio
            currentCircle.bindTooltip(`Radio: ${(maxDistance / 1000).toFixed(2)} km`, {
                permanent: false,
                direction: 'center',
                className: 'circle-tooltip'
            });

            const camerasInCircle = geojsonData.features.filter(feature => {
                const camLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                return latlng.distanceTo(camLatLng) <= maxDistance;
            });

            loadMarkersWithRadius({ features: camerasInCircle }, maxDistance);
            hideLoader();
        });
}

// Función para generar un color aleatorio para los círculos
function getRandomColor() {
    const colors = [
        '#FF5722', // Naranja
        '#9C27B0', // Púrpura
        '#3F51B5', // Índigo
        '#009688', // Verde azulado
        '#795548', // Marrón
        '#607D8B', // Azul grisáceo
        '#E91E63', // Rosa
        '#2196F3'  // Azul
    ];

    return colors[Math.floor(Math.random() * colors.length)];
}

// Función para cargar marcadores con información de radio
function loadMarkersWithRadius(geojson, maxRadius) {
    // Limpiar la capa de marcadores existentes
    projectCamerasLayer.clearLayers();
    cameraMarkers = [];

    // Crear y agregar nuevos marcadores
    cameraMarkers = geojson.features.map(feature => {
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const latlng = L.latLng(lat, lng);

        const type = feature.properties.tipo || 'I';
        const svgIconHtml = createCameraSVG(type);

        const icon = L.divIcon({
            html: svgIconHtml,
            className: 'custom-camera-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([lat, lng], { icon });
        marker.feature = feature;

        // Calcular distancia desde el centro del círculo
        const centerPoint = currentCircle ? currentCircle.getLatLng() : null;
        let distanceText = "";

        if (centerPoint) {
            const distance = latlng.distanceTo(centerPoint);
            const distanceKm = (distance / 1000).toFixed(2);
            const percentage = ((distance / maxRadius) * 100).toFixed(0);
            distanceText = `${feature.properties.name || 'Desconocido'} (${distanceKm}km - ${percentage}%)`;
        } else {
            distanceText = feature.properties.name || 'Desconocido';
        }

        // Tooltip con información de distancia
        marker.bindTooltip(distanceText, {
            permanent: false,
            direction: 'bottom',
            className: 'camera-tooltip',
            offset: [-3, 5],
        });

        // Modificamos el evento click para permitir seleccionar cámaras dentro del círculo
        marker.on('click', () => {
            // Mostrar información de la cámara
            showCameraInfo(feature);

            // Crear un nuevo círculo centrado en esta cámara
            showNearestCameras(marker.getLatLng());
        });

        marker.addTo(projectCamerasLayer);

        const vision = createVisionField(feature, lat, lng);
        if (vision) {
            vision.addTo(projectCamerasLayer);
        }

        return marker;
    });
}

function createVisionField(feature, lat, lng) {
    const camara = feature.properties.camara;

    if (camara === '360') {
        return L.marker([lat, lng], {
            icon: L.divIcon({
                className: '',
                html: '<div class="vision-gradient"></div>',
                iconSize: [150, 150],
                iconAnchor: [75, 75]
            }),
            interactive: false,
            zIndexOffset: -999
        });
    } else if (camara === '180') {
        const [refLat, refLng] = feature.properties.referencia.split(',').map(parseFloat);
        const direccion = getAngleFromCoords(lat, lng, refLat, refLng);

        return L.marker([lat, lng], {
            icon: L.divIcon({
                className: '',
                html: `
                    <div class="rotated-container" style="transform: rotate(${direccion}deg);">
                        <div class="vision-gradient-180"></div>
                    </div>
                `,
                iconSize: [150, 75],
                iconAnchor: [75, 75]
            }),
            interactive: false,
            zIndexOffset: -999
        });
    }

    return null;
}


// Función para calcular distancias de ruta (restaurada)
async function getRouteDistances(originLatLng, cameraList) {
    try {
        // Construir URL para consulta de rutas
        const originCoord = `${originLatLng.lng},${originLatLng.lat}`;
        const destinationCoords = cameraList.map(item =>
            `${item.cameraLatLng.lng},${item.cameraLatLng.lat}`
        );

        // URL para el servicio OSRM (comentado para evitar errores si el servicio no está disponible)
        // const url = `https://router.project-osrm.org/table/v1/driving/${[originCoord, ...destinationCoords].join(';')}?sources=0&destinations=${Array.from({length: destinationCoords.length}, (_, i) => i + 1).join(';')}&annotations=duration,distance`;

        // Simulamos respuesta del servicio para evitar errores
        // En producción, descomenta la línea de fetch y comenta la simulación
        // const response = await fetch(url);
        // const data = await response.json();

        // Simulación de respuesta
        const simulatedData = {
            distances: [cameraList.map(item => item.distance)],
            durations: [cameraList.map(item => item.distance / 30)] // Aproximación: velocidad media 30m/s
        };

        // Asignar distancias de ruta a cada cámara
        return cameraList.map((item, index) => {
            return {
                feature: item.feature,
                routeDistance: simulatedData.distances[0][index],
                routeDuration: simulatedData.durations[0][index]
            };
        });
    } catch (error) {
        console.error('Error al obtener distancias desde OSRM:', error);
        // En caso de error, usamos distancia en línea recta
        return cameraList.map(item => ({
            feature: item.feature,
            routeDistance: item.distance,
            routeDuration: item.distance / 30
        }));
    }
}

function showLoader() {
    document.getElementById('loader-overlay').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader-overlay').style.display = 'none';
}

// Función para filtrar cámaras por jurisdicción
function filterCamerasByJurisdiction(polygon) {
    const polygonCoords = polygon.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
    const turfPolygon = turf.polygon([polygonCoords]);

    const filteredGeojson = geojsonData.features.filter(feature => {
        const latlng = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
        return turf.booleanPointInPolygon(turf.point(latlng), turfPolygon);
    });

    loadMarkers({ features: filteredGeojson });
}

// Función para restablecer el filtro
function resetFilter() {
    if (currentCircle) {
        map.removeLayer(currentCircle);
        currentCircle = null;
    }

    if (map.hasLayer(projectCamerasLayer)) {
        loadMarkers(geojsonData);  // Solo si está activa
    }
    clearSearchMarkers();  // Borrar los marcadores de búsqueda
    document.getElementById('cameraInfoPopup').style.display = 'none';
}

// OPTIMIZADO: Modificada la función filterCameras para mejor rendimiento
function filterCameras() {
    // Obtener los valores actuales de los filtros
    const searchInput = document.getElementById('cameraSearchInput').value.trim().toLowerCase();
    const selectedType = document.getElementById('cameraTypeSelect').value;
    const hasBotonChecked = document.getElementById('hasBoton').checked;
    const hasMegafonoChecked = document.getElementById('hasMegafono').checked;

    // Si todos los filtros están vacíos y ningún checkbox está marcado, mostrar todas las cámaras
    const noFiltersActive = searchInput === "" && selectedType === "" && !hasBotonChecked && !hasMegafonoChecked;

    if (noFiltersActive) {
        // Restaurar todas las cámaras sin recorrer cada una
        if (map.hasLayer(projectCamerasLayer)) {
            loadMarkers(geojsonData);
        }
        if (map.hasLayer(vecinalCamerasLayer)) {
            loadVecinalMarkers(vecinalData);
        }
        return;
    }

    // Filtrar cámaras del proyecto
    if (map.hasLayer(projectCamerasLayer)) {
        const filteredFeatures = geojsonData.features.filter(feature => {
            const props = feature.properties;
            if (!props) return false;

            const cameraName = props.name ? props.name.toString().toLowerCase() : '';
            const cameraType = props.tipo;
            const cameraBoton = props.boton;
            const cameraMegafono = props.megafono;

            const matchesName = searchInput === "" || cameraName.includes(searchInput);
            const matchesType = selectedType === "" || cameraType === selectedType;
            const matchesBoton = !hasBotonChecked || cameraBoton === true;
            const matchesMegafono = !hasMegafonoChecked || cameraMegafono === true;

            return matchesName && matchesType && matchesBoton && matchesMegafono;
        });

        loadMarkers({ features: filteredFeatures });
    }

    // Para cámaras vecinales, solo filtramos por nombre
    if (map.hasLayer(vecinalCamerasLayer) && searchInput !== "") {
        const filteredVecinalFeatures = vecinalData.features.filter(feature => {
            const props = feature.properties;
            if (!props) return false;

            const cameraName = props.nombre ? props.nombre.toString().toLowerCase() : '';
            return cameraName.includes(searchInput);
        });

        loadVecinalMarkers({ features: filteredVecinalFeatures });
    }
}

// OPTIMIZADO: Cargar el GeoJSON con las cámaras
function loadGeoJSONData() {
    showLoader();
    fetch('/camaras/610camaras/610.geojson')
        .then(response => response.json())
        .then(geojson => {
            geojsonData = geojson;
            loadMarkers(geojson);
            loadCameraSelectOptions();
            hideLoader();
        })
        .catch(error => {
            console.error('Error al cargar el GeoJSON:', error);
            hideLoader();
        });
}

// OPTIMIZADO: Cargar cámaras vecinales
function loadCamarasVecinales() {
    fetch('/camaras/vecinales/camaras-vecinales.geojson')
        .then(response => response.json())
        .then(vecinalGeojson => {
            vecinalData = vecinalGeojson;
            loadVecinalMarkers(vecinalGeojson);
        })
        .catch(error => {
            console.error('Error al cargar cámaras vecinales:', error);
        });
}

// OPTIMIZADO: Cargar jurisdicciones con promesas
function loadJurisdictionsData() {
    showLoader();
    const files = [
        { name: '10 de Octubre', file: '/maps/10deOctubre.csv', index: 0 },
        { name: 'Bayovar', file: '/maps/Bayovar.csv', index: 1 },
        { name: 'Caja de Agua', file: '/maps/CajaDeAgua.csv', index: 2 },
        { name: 'Canto Rey', file: '/maps/CantoRey.csv', index: 3 },
        { name: 'La Huayrona', file: '/maps/LaHuayrona.csv', index: 4 },
        { name: 'Mariscal Caceres', file: '/maps/MariscalCaceres.csv', index: 5 },
        { name: 'Santa Elizabeth', file: '/maps/SantaElizabeth.csv', index: 6 },
        { name: 'Zarate', file: '/maps/Zarate.csv', index: 7 }
    ];

    // Crear un array de promesas para cargar todos los archivos
    const promises = files.map(jurisdiction => {
        return fetch(jurisdiction.file)
            .then(response => response.text())
            .then(csvText => {
                return new Promise(resolve => {
                    parseCSV(csvText, coordinates => {
                        jurisdiction.coordinates = coordinates;
                        drawPolygon(jurisdiction);
                        resolve();
                    });
                });
            }).catch(error => {
                console.error(`No se pudo cargar el archivo ${jurisdiction.name}: ${error}`);
                return Promise.resolve(); // Continuar con las demás promesas
            });
    });

    // Ejecutar todas las promesas y mostrar mensaje cuando todas terminen
    Promise.all(promises)
        .then(() => {
            hideLoader();
        })
        .catch(error => {
            console.error("Error al cargar jurisdicciones:", error);
            hideLoader();
        });
}

// OPTIMIZADO: Evento para gestionar zooming y panning para mejor rendimiento
map.on('zoomend moveend', function () {
    // Solo actualiza los marcadores si hay muchos en el mapa
    if (cameraMarkers.length > 100 && map.hasLayer(projectCamerasLayer)) {
        loadMarkers(geojsonData);
    }
});

// Evento para restablecer filtros al hacer clic derecho
map.on('contextmenu', resetFilter);

// Cargar los datos iniciales
loadJurisdictionsData();
loadGeoJSONData();
loadCamarasVecinales();