const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const container = document.body;
const colors = ["#FF1461", "#18FF92", "#5A87FF", "#FBF38C"];
const dotsToAnimate = [];

/**
 * Generate a measurement
 * @param {number} num Number to be added
 */
function generateMeasurement(num) {
  return `${num}px`;
}

/**
 * Create dot elements to animate and append to container
 * @param {number} count Number of dots
 */
function create(count) {
  const dots = new DocumentFragment();
  Array.from(Array(count)).forEach((_, i) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.style.width = "1rem";
    dot.style.height = "1rem";
    dot.style.backgroundColor = colors[anime.random(0, 3)];
    dot.style.top = generateMeasurement(anime.random(0, windowHeight));
    dot.style.left = generateMeasurement(anime.random(0, windowWidth));
    dotsToAnimate.push(dot);
    dots.appendChild(dot);
  });
  container.appendChild(dots);
}

function initialAnimation() {
  const tl = anime.timeline({
    easing: "easeOutQuart",
    duration: 1000,
  });
  tl.add({
    targets: ".background",
    height: "100%",
    translateY: "-50%",
    translateX: "-10%",
    rotate: "-10deg",
    delay: 400,
    duration: 800,
    easing: "easeInOutCirc",
  });
  tl.add({
    targets: ".background",
    rotate: 0,
    translateY: "-50%",
    translateX: "-10%",
    duration: 400,
    easing: "easeInOutCirc",
  });
  tl.add({
    targets: ".initial",
    translateY: -20,
    translateX: 20,
    delay: anime.stagger(600),
    opacity: 1,
  });
  tl.add({
    targets: ".image",
    duration: 600,
    opacity: 1,
  });
  tl.add({
    targets: dotsToAnimate,
    scale: {
      value: [0, 1],
      duration: 1000,
      easing: "spring",
    },
  });
}

function init() {
  create(6);
  initialAnimation();
}

init();
