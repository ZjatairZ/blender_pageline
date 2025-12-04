let scene, camera, renderer, controls, model, container, ambientLight, directionalLight;
let clock = new THREE.Clock();

// Raycaster para clics
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Estado de encendido/apagado
let monitorOn = false;

// Ruta del modelo
const MODEL_PATH = './modelo/escritorio/portafolio.gltf';

function initThreeJS() {
    container = document.getElementById('three-canvas-container');

    if (!container) {
        console.error("Contenedor 'three-canvas-container' no encontrado.");
        return;
    }

    const aspectRatio = container.clientWidth / container.clientHeight;

    // Escena
    scene = new THREE.Scene();

    // Cámara
    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Luces
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Controles de cámara
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 0.5, 0);
    controls.update();

    // Cargar modelo GLTF
    const loader = new THREE.GLTFLoader();
    loader.load(
        MODEL_PATH,
        (gltf) => {
            model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            scene.add(model);

            applyTheme(document.documentElement.classList.contains('dark'));
        },
        (xhr) => {
            console.log(`Cargando modelo 3D: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
        },
        (error) => {
            console.error('Error al cargar el modelo:', error);
        }
    );

    animate();
}


// FUNCIÓN DE PARTÍCULAS
function particleBurst() {
    const count = 80; 
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = Math.random() * 0.7;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.06,
        color: 0x6366f1,
        transparent: true,
        opacity: 1
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let opacity = 1;

    const fadeInterval = setInterval(() => {
        opacity -= 0.05;
        material.opacity = opacity;

        if (opacity <= 0) {
            clearInterval(fadeInterval);
            scene.remove(particles);
            geometry.dispose();
            material.dispose();
        }
    }, 50);
}


// DETECTAR CLIC SOBRE EL MONITOR 
function onClickScene(event) {
    if (!model) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        // 👉 Nombre exacto del objeto en Blender
        if (obj.name === "Monitor") {

            monitorOn = !monitorOn; // alternar estado

            if (monitorOn) {
                obj.material.emissive.setHex(0x00aaff);
                obj.material.emissiveIntensity = 2;
                particleBurst(); // efecto especial opcional
            } else {
                obj.material.emissive.setHex(0x000000);
                obj.material.emissiveIntensity = 0;
            }
        }
    }
}


// Animación principal
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    controls.update();
    renderer.render(scene, camera);
}


// Resize
function onWindowResize() {
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}


// Dark Mode y luces
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        directionalLight.color.setHex(0xaaaaee);
        directionalLight.intensity = 2;
        ambientLight.intensity = 1.2;
    } else {
        document.documentElement.classList.remove('dark');
        directionalLight.color.setHex(0xffffff);
        directionalLight.intensity = 1.5;
        ambientLight.intensity = 0.8;
    }
}


// Botón dark mode
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        applyTheme(isDark);
    });
}


// Botón partículas
const btnParticulas = document.getElementById("btn-particulas");
if (btnParticulas) {
    btnParticulas.addEventListener("click", () => {
        particleBurst();
    });
}


// LISTENERS
window.addEventListener('load', () => {
    initThreeJS();
    renderer.domElement.addEventListener("click", onClickScene);
    window.addEventListener('resize', onWindowResize, false);
});
