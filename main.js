let scene, camera, renderer, controls, model, container, ambientLight, directionalLight;

// RUTA CORRECTA DE TU MODELO (.glb dentro de assets/escritorio/)
const MODEL_PATH = './assets/escritorio/portafolio.glb';

function initThreeJS() {
    container = document.getElementById('three-canvas-container');

    if (!container) {
        console.error("Contenedor 'three-canvas-container' no encontrado.");
        return;
    }

    const aspectRatio = container.clientWidth / container.clientHeight;

    // 1. Escena
    scene = new THREE.Scene();

    // 2. Cámara
    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 4. Luces
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // 5. Controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 0.5, 0);
    controls.update();

    // 6. CARGA CORRECTA DEL MODELO GLB
    const loader = new THREE.GLTFLoader();
    loader.load(
        MODEL_PATH,
        (gltf) => {
            model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            scene.add(model);

            console.log("Modelo cargado correctamente:", MODEL_PATH);

            applyTheme(document.documentElement.classList.contains('dark'));
        },
        (xhr) => {
            if (xhr.total) {
                console.log(`Cargando modelo 3D: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
            }
        },
        (error) => {
            console.error('❌ Error al cargar el modelo 3D:', error);
            container.innerHTML = `
                <p class="text-center text-red-500 p-8">
                    ❌ No se pudo cargar <b>portafolio.glb</b>
                    <br>Revisa que el archivo está en:
                    <br><code>/assets/escritorio/portafolio.glb</code>
                </p>`;
        }
    );

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// MODO OSCURO / CLARO
function applyTheme(isDarkMode) {
    if (!directionalLight || !ambientLight) return;

    if (isDarkMode) {
        directionalLight.color.setHex(0xaaaaee);
        directionalLight.intensity = 2;
        ambientLight.intensity = 1.2;
    } else {
        directionalLight.color.setHex(0xffffff);
        directionalLight.intensity = 1.5;
        ambientLight.intensity = 0.8;
    }
}

// Botón de dark mode
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        applyTheme(isDarkMode);
    });
}

// INICIALIZACIÓN
window.addEventListener('load', () => {
    initThreeJS();
    window.addEventListener('resize', onWindowResize, false);
});
