const canvas = document.getElementById("cayleyCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let dpr = 1;
let nodes = [];



const generators = [
    { letter: "a", inverse: "A" },
    { letter: "A", inverse: "a" },
    { letter: "b", inverse: "B" },
    { letter: "B", inverse: "b" }
];

function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildGraph();
    draw();
}

function inverseOf(letter) {
    const generator = generators.find(
        (item) => item.letter === letter
    );

    return generator ? generator.inverse : "";
}

function buildGraph() {
    nodes = [];

    const centreX = width * 0.76;
    const centreY = height * 0.43;
    const maxRadius = Math.max(width, height) * 0.69;
    const maxDepth = width < 700 ? 4 : 5;

    const root = {
        word: "",
        x: centreX,
        y: centreY,
        depth: 0,
        parent: null
    };

    nodes.push(root);

    function addChildren(parent, startAngle, endAngle) {
        if (parent.depth >= maxDepth) {
            return;
        }

        const lastLetter = parent.word[parent.word.length - 1];

        const possibleGenerators = generators.filter((generator) => {
            return !lastLetter || generator.letter !== inverseOf(lastLetter);
        });

        possibleGenerators.forEach((generator, index) => {
            const portion = (endAngle - startAngle) / possibleGenerators.length;

            const childStart = startAngle + index * portion;
            const childEnd = childStart + portion;
            const angle = (childStart + childEnd) / 2;

            const radius =
                maxRadius * (parent.depth + 1) / (maxDepth + 0.5);

            const child = {
                word: parent.word + generator.letter,
                x: centreX + Math.cos(angle) * radius,
                y: centreY + Math.sin(angle) * radius,
                depth: parent.depth + 1,
                parent
            };

            nodes.push(child);

            /* Keep small gaps between descendant branches. */
            const padding = portion * 0.08;

            addChildren(
                child,
                childStart + padding,
                childEnd - padding
            );
        });
    }

    addChildren(root, 0, Math.PI * 2);
}

function draw() {
    /* Transparent canvas: CSS supplies the pure black background. */
    ctx.clearRect(0, 0, width, height);

    /* Draw edges first. */
    nodes.forEach((node) => {
        if (!node.parent) {
            return;
        }

        //const alpha = Math.max(0.035, 0.16 - node.depth * 0.02);
        const alpha = Math.max(0.15, 0.42 - node.depth * 0.045);


        ctx.beginPath();
        ctx.moveTo(node.parent.x, node.parent.y);
        ctx.lineTo(node.x, node.y);

        ctx.strokeStyle = "#e0527a";
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 0.85;

        ctx.stroke();
    });

    /* Draw vertices after the edges. */
    nodes.forEach((node) => {
        const radius =
            node.depth === 0
                ? 4.3
                : Math.max(1.05, 2.1 - node.depth * 0.2);

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

        ctx.fillStyle =
            node.depth === 0
                ? "#f1a7c0"
                : "#e0527a";

        ctx.globalAlpha =
            node.depth === 0
                ? 0.92
                : 0.28;

        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

window.addEventListener("resize", resizeCanvas);

/* ---------- Mobile navigation ---------- */

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");

        navToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

/* ---------- Start ---------- */

resizeCanvas();