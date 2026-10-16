// Autor: Diego Maximiliano Vazquez Ruiz
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const contadorDiv = document.getElementById("contador");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;

let eliminadas = 0;
const totalObjetos = 25;

class Star {
  constructor(x, y, radius) {
    this.posX = x;
    this.posY = y;
    this.radius = radius; // Radio externo de la estrella
    this.color = this.obtenerColorAleatorio();
    
    // Física de caída libre
    this.vx = (Math.random() - 0.5) * 1.5; // Ligero desplazamiento horizontal
    this.vy = Math.random() * 2 + 1;       // Velocidad de caída inicial aleatoria
    this.gravity = 0.2;                    // Aceleración por gravedad
    this.bounce = 0.55;                    // Factor de reducción de rebote
    this.bouncesLeft = 3;                  // Cantidad de rebotes antes de reciclarse arriba
    this.rotation = Math.random() * Math.PI; // Rotación inicial para mayor dinamismo
    this.rotSpeed = (Math.random() - 0.5) * 0.03; // Velocidad de giro
  }

  obtenerColorAleatorio() {
    const colores = ["#ffeb3b", "#ff5722", "#e91e63", "#9c27b0", "#00bcd4", "#ff9800", "#ffffff"];
    return colores[Math.floor(Math.random() * colores.length)];
  }

  // Reglas de velocidad según el contador de eliminaciones
  obtenerMultiplicadorVelocidad() {
    if (eliminadas > 20) {
      return 2.2; // Velocidad alta
    } else if (eliminadas > 10) {
      return 1.5; // Velocidad media
    }
    return 1.0;   // Velocidad inicial predefinida
  }

  draw(context) {
    context.save();
    context.translate(this.posX, this.posY);
    context.rotate(this.rotation);

    // Dibujar forma de estrella de 5 picos
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    let x = 0;
    let y = 0;
    let step = Math.PI / spikes;

    context.beginPath();
    context.moveTo(0, 0 - this.radius);

    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * this.radius;
      y = Math.sin(rot) * this.radius;
      context.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * (this.radius * 0.4); // Radio interno de la estrella
      y = Math.sin(rot) * (this.radius * 0.4);
      context.lineTo(x, y);
      rot += step;
    }
    context.lineTo(0, 0 - this.radius);
    context.closePath();

    context.fillStyle = this.color;
    context.fill();
    context.lineWidth = 1.5;
    context.strokeStyle = "#333333";
    context.stroke();

    context.restore();
  }

  update(context) {
    let mult = this.obtenerMultiplicadorVelocidad();

    // Aplicar gravedad y velocidad
    this.vy += this.gravity;
    this.posY += this.vy * mult;
    this.posX += this.vx * mult;
    this.rotation += this.rotSpeed; // Actualizar giro de la estrella

    // Rebote en el marco inferior del canvas (suelo) generando parábola
    if (this.posY + this.radius >= window_height) {
      this.posY = window_height - this.radius;
      this.vy = -this.vy * this.bounce; // Invierte sentido y pierde fuerza
      this.bouncesLeft--;

      // Si se queda sin rebotes o la velocidad es mínima, se reinicia arriba
      if (this.bouncesLeft <= 0 || Math.abs(this.vy) < 0.6) {
        this.resetToTop();
      }
    }

    // Rebote en paredes laterales del canvas
    if (this.posX - this.radius < 0 || this.posX + this.radius > window_width) {
      this.vx = -this.vx;
    }

    this.draw(context);
  }

  // Reiniciar objeto arriba del margen superior con caída libre
  resetToTop() {
    this.posX = Math.random() * (window_width - 80) + 40;
    this.posY = -Math.random() * 150 - 30; // Justo arriba del margen superior
    this.vy = Math.random() * 2 + 1;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.bouncesLeft = 3;
    this.color = this.obtenerColorAleatorio();
  }
}

// Crear un array para almacenar los 25 objetos
let stars = [];

function generateStars(n) {
  for (let i = 0; i < n; i++) {
    let radius = Math.random() * 12 + 15; // Radio entre 15 y 27
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * window_height; // Distribución inicial en pantalla
    stars.push(new Star(x, y, radius));
  }
}

// Detección de clic izquierdo del mouse para eliminar el objeto
window.addEventListener("click", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  for (let i = 0; i < stars.length; i++) {
    let s = stars[i];
    let distX = mouseX - s.posX;
    let distY = mouseY - s.posY;
    let distance = Math.sqrt(distX * distX + distY * distY);

    // Si el clic izquierdo impacta dentro del radio de la estrella
    if (distance <= s.radius + 5) {
      eliminadas++;
      contadorDiv.textContent = `Eliminadas: ${eliminadas}`;
      s.resetToTop(); // Vuelve a aparecer arriba inmediatamente para mantener los 25 objetos
      break;
    }
  }
});

// Función principal de animación
function animate() {
  ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas

  stars.forEach(star => {
    star.update(ctx);
  });

  requestAnimationFrame(animate);
}

// Inicializar los 25 objetos y arrancar animación
generateStars(totalObjetos);
animate();