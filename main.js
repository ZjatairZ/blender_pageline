let scene, camera, renderer, controls, model, container, ambientLight, directionalLight;
let clock = new THREE.Clock();

// Raycaster para clics
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Estado del monitor
let monitorOn = false;

// RUTA CORRECTA DE TU MODELO .glb
const MODEL_PATH = './assets/escritorio/portafolio.glb';


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

    // Controles
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 0.5, 0);
    controls.update();

    // Cargar modelo GLB
    const loader = new THREE.GLTFLoader();
    loader.load(
        MODEL_PATH,
        (gltf) => {
            model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);

            // IMPORTANTE: permitir que los materiales respondan a emisivos
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            });

            scene.add(model);

            console.log("Modelo cargado:", MODEL_PATH);

            applyTheme(document.documentElement.classList.contains("dark"));
        },
        (xhr) => {
            console.log(`Cargando modelo: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
        },
        (error) => {
            console.error("❌ ERROR cargando modelo GLB:", error);
        }
    );

    animate();
}


// EFECTO DE PARTÍCULAS
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


// CLIC EN EL MONITOR
function onClickScene(event) {
    if (!model) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(model, true);
    if (intersects.length === 0) return;

    const obj = intersects[0].object;

    console.log("Objeto clickeado:", obj.name);

    // CAMBIA "Monitor" POR EL NOMBRE EXACTO DE BLENDER
    if (obj.name.includes("Monitor")) {

        monitorOn = !monitorOn;

        if (monitorOn) {
            obj.material.emissive.setHex(0x00aaff);
            obj.material.emissiveIntensity = 2;
            particleBurst();
        } else {
            obj.material.emissive.setHex(0x000000);
            obj.material.emissiveIntensity = 0;
        }
    }
}


// ANIMACIÓN PRINCIPAL
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}


// AJUSTE AL REDIMENSIONAR
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}


// DARK MODE
function applyTheme(isDark) {
    if (isDark) {
        directionalLight.color.setHex(0xaaaaee);
        directionalLight.intensity = 2;
        ambientLight.intensity = 1.2;
    } else {
        directionalLight.color.setHex(0xffffff);
        directionalLight.intensity = 1.5;
        ambientLight.intensity = 0.8;
    }
}


// BOTONES
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle("dark");
        applyTheme(isDark);
    });
}


// INICIALIZACIÓN
window.addEventListener("load", () => {
    initThreeJS();
    renderer.domElement.addEventListener("click", onClickScene);
    window.addEventListener("resize", onWindowResize);
});
