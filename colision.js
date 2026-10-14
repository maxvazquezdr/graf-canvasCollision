// Autor: Diego Maximiliano Vazquez Ruiz
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#a8f0a8"; // Fondo verde claro

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.originalColor = color; // Almacena el color original para restaurarlo tras el destello
    this.color = color;
    this.text = text;
    this.speed = speed;
    this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
    this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
    this.flashTimer = 0;     // Temporizador para el efecto de "flash" en azul
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillStyle = this.color;
    context.fillText(this.text, this.posX, this.posY);
    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  update(context) {
    this.draw(context);

    // Actualizar la posición X y rebotar en los bordes
    this.posX += this.dx;
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }

    // Actualizar la posición Y y rebotar en los bordes
    this.posY += this.dy;
    if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
      this.dy = -this.dy;
    }

    // Gestionar el destello azul al colisionar
    if (this.flashTimer > 0) {
      this.color = "#0000FF"; // Azul durante el impacto
      this.flashTimer--;
    } else {
      this.color = this.originalColor; // Regresar al color original
    }
  }

  // Método de la P.O.O. para detectar colisión por distancia entre centros
  detectCollision(otherCircle) {
    let distX = this.posX - otherCircle.posX;
    let distY = this.posY - otherCircle.posY;
    let distance = Math.sqrt(distX * distX + distY * distY);

    return distance <= (this.radius + otherCircle.radius);
  }

  // Método para resolver el rebote y separar los círculos para que no se queden pegados
  resolveCollision(otherCircle) {
    let distX = this.posX - otherCircle.posX;
    let distY = this.posY - otherCircle.posY;
    let distance = Math.sqrt(distX * distX + distY * distY);

    // Calcular la superposición (cuánto se están metiendo uno dentro del otro)
    let overlap = (this.radius + otherCircle.radius) - distance;

    if (distance > 0 && overlap > 0) {
      // Vector normalizado de separación
      let nx = distX / distance;
      let ny = distY / distance;

      // Separar los círculos proporcionalmente para sacarlos del solapamiento
      this.posX += nx * (overlap / 2);
      this.posY += ny * (overlap / 2);
      otherCircle.posX -= nx * (overlap / 2);
      otherCircle.posY -= ny * (overlap / 2);
    }

    // Invertir las direcciones (dx y dy) para rebotar en sentido contrario
    this.dx = -this.dx;
    this.dy = -this.dy;
    otherCircle.dx = -otherCircle.dx;
    otherCircle.dy = -otherCircle.dy;

    // Activar el destello azul por unos cuantos fotogramas
    this.flashTimer = 15;
    otherCircle.flashTimer = 15;
  }
}

// Crear un array para almacenar los 20 círculos
let circles = [];

// Función para generar los 20 círculos con velocidad lenta (entre 0.5 y 1.5 unidades)
function generateCircles(n) {
  for (let i = 0; i < n; i++) {
    let radius = Math.random() * 20 + 15; // Radio entre 15 y 35
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;
    let color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`; // Color aleatorio
    let speed = Math.random() * 1.0 + 0.5; // Velocidad lenta entre 0.5 y 1.5 unidades
    let text = `C${i + 1}`;
    circles.push(new Circle(x, y, radius, color, text, speed));
  }
}

// Conjunto para evitar aplicar múltiples rebotes en un mismo ciclo de animación
let checkedPairs = new Set();

// Función para animar los círculos y gestionar colisiones y rebotes
function animate() {
  ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas

  checkedPairs.clear();

  // Comprobar colisiones entre cada par único de círculos
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      if (circles[i].detectCollision(circles[j])) {
        let pairKey = `${i}-${j}`;
        if (!checkedPairs.has(pairKey)) {
          circles[i].resolveCollision(circles[j]);
          checkedPairs.add(pairKey);
        }
      }
    }
  }

  // Actualizar cada círculo (dibujo, movimiento y control de destello)
  circles.forEach(circle => {
    circle.update(ctx);
  });

  requestAnimationFrame(animate); // Repetir la animación
}

// Generar 20 círculos y comenzar la animación
generateCircles(20);
animate();