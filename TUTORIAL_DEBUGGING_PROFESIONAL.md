# 🐛 TUTORIAL: Debugging Profesional - Adiós a console.log

## 📅 Tutorial completo para debugear sin console.log

---

## ¿Por qué NO usar console.log?

### ❌ Problemas con console.log:

1. **Contamina el código** - Llenan el archivo con líneas innecesarias
2. **Se te olvida eliminarlos** - Terminan en producción
3. **Difícil de gestionar** - Tienes que borrarlos uno por uno
4. **Lento** - Tienes que recargar la página cada vez
5. **Limitado** - Solo ves lo que imprimes, no el contexto completo

### ✅ Con debugging profesional:

1. **No modifica el código** - No agregas líneas
2. **Pausas la ejecución** - Inspeccio nas el estado exacto
3. **Ves TODO** - Variables locales, scope, call stack
4. **Puedes experimentar** - Ejecutas código en la consola en tiempo real
5. **Más rápido** - No necesitas recargar

---

## 🛠️ HERRAMIENTA 1: Chrome DevTools - Breakpoints

### ¿Qué son los breakpoints?

Un **breakpoint** es un punto de pausa que le dice al navegador:

> "Detente aquí y déjame inspeccionar el código"

### Cómo usar breakpoints:

#### Paso 1: Abrir DevTools

```
Windows/Linux: F12 o Ctrl+Shift+I
Mac: Cmd+Option+I
```

#### Paso 2: Ir a la pestaña "Sources" (Fuentes)

#### Paso 3: Encontrar tu archivo

- En el panel izquierdo, navega a `src/components/...`
- O usa `Ctrl+P` (Cmd+P en Mac) para buscar rápido

#### Paso 4: Hacer clic en el número de línea

- Se pone un punto azul ⬤
- Esa línea ahora es un breakpoint

#### Paso 5: Recargar la página

- El código se detendrá en ese punto
- Ahora puedes inspeccionar TODO

### Ejemplo práctico:

**Antes (con console.log):**

```javascript
function calcularTotal(items) {
  console.log('🔍 Items recibidos:', items); // ❌ Malo

  const total = items.reduce((sum, item) => {
    console.log('📊 Sumando item:', item); // ❌ Malo
    return sum + item.precio;
  }, 0);

  console.log('💰 Total calculado:', total); // ❌ Malo
  return total;
}
```

**Después (con breakpoints):**

```javascript
function calcularTotal(items) {
  // ← Pon un breakpoint en esta línea (clic en el número)
  const total = items.reduce((sum, item) => {
    return sum + item.precio; // ← Otro breakpoint aquí
  }, 0);

  return total; // ← Y otro aquí
}
```

Cuando el código se pause:

- **Panel derecho "Scope"** - Ver el valor de `items`, `total`, `sum`, `item`
- **Panel "Call Stack"** - Ver qué función llamó a esta
- **Consola** - Escribe `items.length` para ver cuántos hay

---

## 🎮 CONTROLES DE DEBUGGING

Cuando el código está pausado, tienes estos botones:

| Botón        | Atajo     | Función                                         |
| ------------ | --------- | ----------------------------------------------- |
| ▶️ Resume    | F8        | Continuar hasta el siguiente breakpoint         |
| ⤵️ Step Over | F10       | Ejecutar la línea actual y pasar a la siguiente |
| ⬇️ Step Into | F11       | Entrar dentro de una función                    |
| ⬆️ Step Out  | Shift+F11 | Salir de la función actual                      |
| ↻ Step       | -         | Ejecutar paso a paso                            |

### Cuándo usar cada uno:

**Step Over (F10)** - Lo más común

```javascript
const resultado = procesarDatos(data); // ← Estás aquí, presiona F10
console.log(resultado); // ← Saltas a aquí SIN entrar en procesarDatos()
```

**Step Into (F11)** - Para entrar en funciones

```javascript
const resultado = procesarDatos(data); // ← Presiona F11 aquí

// Y saltas DENTRO de procesarDatos:
function procesarDatos(data) {
  // ← Terminas aquí, dentro de la función
  return data.map(...)
}
```

**Step Out (Shift+F11)** - Para salir rápido

```javascript
function funcionLarga() {
  linea1();
  linea2();
  linea3(); // ← Estás aquí pero no te interesa el resto
  // Presiona Shift+F11 para salir y volver a quien llamó esta función
  linea4();
  linea5();
}
```

---

## 🎯 TÉCNICAS AVANZADAS

### 1. Conditional Breakpoints (Breakpoints Condicionales)

**Problema:** Solo quieres pausar cuando `item.precio > 100`

**Solución:**

1. Click derecho en el número de línea
2. "Add conditional breakpoint..."
3. Escribe: `item.precio > 100`
4. Ahora solo se pausa cuando la condición es verdadera

**Ejemplo:**

```javascript
items.forEach(item => {
  // ← Breakpoint condicional aquí: item.precio > 100
  procesarItem(item);
});
```

### 2. Logpoints (Puntos de Log)

**Problema:** Quieres ver valores sin pausar el código

**Solución:**

1. Click derecho en el número de línea
2. "Add logpoint..."
3. Escribe: `"Item:", item.nombre, "Precio:", item.precio`
4. Aparece en la consola SIN pausar el código

**Es como console.log pero SIN modificar el código** ✨

### 3. Watch Expressions (Expresiones de Vigilancia)

Panel derecho → "Watch" → Agregar expresión

**Ejemplos:**

```javascript
items.length; // Ver siempre cuántos items hay
items[0].precio; // Ver el precio del primer item
total > 1000; // Ver si el total supera 1000
```

---

## 🔍 HERRAMIENTA 2: Network Tab (Pestaña Red)

### Para debugear llamadas a API

#### Paso 1: Abrir DevTools → Network

#### Paso 2: Recargar la página

#### Paso 3: Ver todas las peticiones HTTP

**Información que puedes ver:**

- ✅ URL completa de la petición
- ✅ Método (GET, POST, etc.)
- ✅ Status code (200, 404, 500)
- ✅ Headers (cabeceras)
- ✅ Payload (datos enviados)
- ✅ Response (respuesta del servidor)
- ✅ Tiempo de carga

**Ejemplo práctico:**

Antes (con console.log):

```javascript
fetch('/api/camaras')
  .then(res => res.json())
  .then(data => {
    console.log('📷 Datos de cámaras:', data); // ❌ Malo
  })
  .catch(err => {
    console.error('❌ Error:', err); // ❌ Malo
  });
```

Después (con Network Tab):

1. Abre DevTools → Network
2. Filtra por "Fetch/XHR"
3. Busca la petición a `/api/camaras`
4. Click en ella → Ver "Response" tab
5. **Ves la respuesta completa en formato JSON hermoso** ✨

**Puedes también:**

- Click derecho → "Copy as fetch" (copiar como código)
- Click derecho → "Copy response" (copiar respuesta)
- Ver cuánto tardó (timing)

---

## ⚛️ HERRAMIENTA 3: React DevTools

### Instalación:

Chrome Web Store: "React Developer Tools"

### Qué puedes hacer:

#### 1. Ver el árbol de componentes

- Pestaña "Components" en DevTools
- Ver todos los componentes React montados
- Ver su jerarquía

#### 2. Inspeccionar props y state

- Click en un componente
- Panel derecho muestra:
  - **Props** - Ver qué props recibe
  - **State** - Ver el estado actual
  - **Hooks** - Ver valores de useState, useEffect, etc.

#### 3. Modificar valores en vivo

- Puedes cambiar el state y ver cambios en tiempo real
- Útil para probar edge cases

**Ejemplo:**

Antes (con console.log):

```javascript
function CapaCamaras({ visible, camaras }) {
  const [seleccionada, setSeleccionada] = useState(null);

  console.log('visible:', visible); // ❌ Malo
  console.log('camaras:', camaras); // ❌ Malo
  console.log('seleccionada:', seleccionada); // ❌ Malo

  // ... resto del código
}
```

Después (con React DevTools):

1. Inspecciona el componente `CapaCamaras`
2. En el panel derecho verás:

   ```
   Props:
     visible: true
     camaras: Array(610)

   Hooks:
     State: null  ← Este es seleccionada
   ```

3. Puedes hacer click y cambiar `visible` a `false` para probar

---

## 🎨 HERRAMIENTA 4: Console.assert y console.table

Si REALMENTE necesitas usar la consola, usa estas alternativas mejores:

### console.assert() - Solo muestra si falla

```javascript
// Antes ❌
if (items.length === 0) {
  console.log('⚠️ No hay items');
}

// Después ✅
console.assert(items.length > 0, '⚠️ No hay items');
// Solo se muestra si items está vacío
```

### console.table() - Muestra arrays bonitos

```javascript
// Antes ❌
console.log('Cámaras:', camaras);
// Muestra: Array(610) [...]

// Después ✅
console.table(camaras);
// Muestra una tabla hermosa con columnas
```

### console.time() - Medir performance

```javascript
console.time('clustering');
const clusters = calcularClusters(datos);
console.timeEnd('clustering');
// Muestra: clustering: 234.56ms
```

---

## 🏆 EJERCICIO PRÁCTICO

Vamos a debugear este código SIN console.log:

```javascript
function buscarCamaraCercana(latitud, longitud, camaras) {
  let camaraMasCercana = null;
  let distanciaMinima = Infinity;

  camaras.forEach(camara => {
    const distancia = calcularDistancia(latitud, longitud, camara.lat, camara.lng);

    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      camaraMasCercana = camara;
    }
  });

  return camaraMasCercana;
}
```

### Misión: Encontrar por qué devuelve `null`

#### Método MALO (console.log):

```javascript
console.log('Entrada:', latitud, longitud);
camaras.forEach(camara => {
  console.log('Cámara:', camara);
  const distancia = calcularDistancia(...);
  console.log('Distancia:', distancia);
  console.log('Mínima actual:', distanciaMinima);
});
console.log('Resultado:', camaraMasCercana);
// 😫 5 console.log para eliminar después
```

#### Método BUENO (breakpoints):

1. Pon un breakpoint en la línea `camaras.forEach`
2. Presiona F10 para entrar al forEach
3. En el panel "Scope" verás:
   - `camaras` - ¿Tiene elementos?
   - `distancia` - ¿Es un número válido?
   - `distanciaMinima` - ¿Se está actualizando?
4. Si encuentras el problema, quitas el breakpoint
5. **No modificaste ni una línea de código** ✨

---

## 📱 DEBUGGING EN DIFERENTES ESCENARIOS

### 1. Error en un click event

```javascript
const handleClick = e => {
  // ← Breakpoint aquí
  const coords = e.latlng;
  procesarCoordenadas(coords);
};
```

1. Pon breakpoint
2. Haz click en el mapa
3. El código se pausa
4. Inspecciona `e.latlng` en el panel Scope

### 2. Error en useEffect

```javascript
useEffect(() => {
  // ← Breakpoint aquí
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      // ← Otro breakpoint aquí
      setDatos(data);
    });
}, []);
```

1. Breakpoint en el fetch
2. Breakpoint en el .then
3. Ver en Network tab si la petición fue exitosa
4. Ver `data` en el panel Scope

### 3. Error en un cálculo

```javascript
const calcularTotal = items => {
  // ← Breakpoint aquí
  return items.reduce((sum, item) => {
    // ← Breakpoint aquí también
    return sum + item.precio;
  }, 0);
};
```

1. Breakpoint en el reduce
2. Presiona F10 varias veces
3. Ve cómo `sum` se incrementa
4. Identifica dónde falla

---

## 🎓 RESUMEN: Cuándo usar cada herramienta

| Situación               | Herramienta           | Por qué                  |
| ----------------------- | --------------------- | ------------------------ |
| Bug en lógica de código | Breakpoints           | Ver variables y flujo    |
| API no funciona         | Network Tab           | Ver request/response     |
| Props incorrectas       | React DevTools        | Ver props del componente |
| State no se actualiza   | React DevTools        | Ver hooks y state        |
| Código lento            | Performance Tab       | Ver qué tarda más        |
| Error en cálculo        | Breakpoints + Consola | Probar expresiones       |
| Error en evento         | Breakpoints           | Ver objeto del evento    |

---

## ✅ CHECKLIST: Debugging Profesional

Antes de usar console.log, pregúntate:

- [ ] ¿Puedo usar un breakpoint y ver la variable directamente?
- [ ] ¿Es un problema de API? → Network Tab
- [ ] ¿Es un problema de React? → React DevTools
- [ ] ¿Necesito ver un array? → console.table()
- [ ] ¿Solo quiero verificar una condición? → console.assert()
- [ ] ¿Quiero medir tiempo? → console.time()

---

## 🚀 PRÓXIMOS PASOS

1. **Practica con tu código actual:**
   - Abre `src/components/capas/CamarasMunicipales/CapaCamarasMunicipales.jsx`
   - Pon un breakpoint en la línea 209 (donde está el logger.log)
   - Recarga la página y explora

2. **Aprende los shortcuts:**
   - F8 (Resume)
   - F10 (Step Over)
   - F11 (Step Into)
   - Ctrl+P (Buscar archivo)

3. **Instala React DevTools:**
   - Chrome Web Store
   - Busca "React Developer Tools"
   - Instala la extensión

4. **Elimina console.log gradualmente:**
   - Cada vez que veas uno, reemplázalo con un breakpoint
   - Verás que es más rápido y efectivo

---

## 📚 RECURSOS ADICIONALES

- [Chrome DevTools Docs](https://developer.chrome.com/docs/devtools/)
- [React DevTools Guide](https://react.dev/learn/react-developer-tools)
- [Debugging JavaScript Video Tutorial](https://www.youtube.com/watch?v=AX7uybwukkk)

---

## 💡 CONSEJO FINAL

> **La mejor forma de aprender es practicando. **
>
> Abre DevTools ahora mismo, pon un breakpoint en cualquier archivo de tu proyecto, y empieza a explorar. En 10 minutos te darás cuenta de que es MUCHO más poderoso que console.log.

**¡Feliz debugging! 🐛✨**
