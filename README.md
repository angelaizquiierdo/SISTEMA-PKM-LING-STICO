# Sistema PKM Lingüístico (Inglés - Español)

![Node.js](https://img.shields.io/badge/Backend-Node.js_%7C_Express_%7C_TypeScript-green)
![React](https://img.shields.io/badge/Frontend-React_%7C_Vite-blue)
![React Native](https://img.shields.io/badge/Mobile-React_Native_%7C_Expo-purple)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-brightgreen)
![AWS](https://img.shields.io/badge/Cloud-AWS_EC2_%7C_VPC-orange)

Plataforma de Gestión del Conocimiento Personal (**PKM**) enfocada en el aprendizaje autónomo de vocabulario bilingüe. El sistema prioriza la modularidad, el desacoplamiento de interfaces y la integración con fuentes lexicográficas estructuradas y bases de datos de oraciones de código abierto, permitiendo un control manual y organizado mediante carpetas temáticas de medios (libros, películas, canciones).
---

## Índice
1. [Objetivos del Proyecto](#1-objetivos-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Gestión de Datos y Categorización](#4-gestión-de-datos-y-categorización-enfoque-manual)
5. [Fases de Desarrollo y Cronograma](#5-fases-de-desarrollo-y-cronograma)

---

## 1. Objetivos del Proyecto

- **Desacoplamiento de Capas:** Separar estrictamente la lógica de negocio (Backend Core) de las interfaces de consumo (Web y Móvil).
- **Fuentes Lexicográficas y de Contexto Robustas:** Integración de una API de Diccionario profesional para definiciones formales, fonética y categorías gramaticales, combinada con la API de Tatoeba para ejemplos de uso real y bilingüe, evitando dependencias de traductores automáticos literales o *scrapers* inestables.
- **Estructuración de Datos Flexible:** Implementar un modelo de base de datos no relacional que soporte relaciones estructuradas entre términos, definiciones, contextos y colecciones de usuario.
- **Infraestructura Cloud Nativa:** Despliegue de los servicios backend en un entorno de nube simulando arquitecturas de producción reales bajo estándares de AWS.

---

## 2. Arquitectura del Sistema

La arquitectura sigue un patrón cliente-servidor desacoplado:

- **Capa de Presentación (Frontends):**
  - **Web Client:** Desarrollada con React y Vite, optimizada para la gestión masiva, visualización y organización de fichas de vocabulario desde el navegador.
  - **Mobile Client:** Desarrollada con React Native (Expo), optimizada para consultas rápidas y repasos en movilidad, consumiendo exactamente los mismos endpoints que la versión web.
- **Capa de Lógica y Servicios (Backend Core):** API RESTful en Node.js y TypeScript que orquesta las peticiones, consulta en paralelo las APIs externas y gestiona la persistencia.
- **Capa de Persistencia de Datos:** MongoDB en la nube para almacenar colecciones de palabras, definiciones, oraciones contextualizadas y carpetas de medios.
- **Capa de Infraestructura (Cloud):** Alojado en Amazon Web Services (AWS) mediante redes virtuales aisladas (VPC) e instancias EC2.


---

## 3. Stack Tecnológico

| Capa Tecnológica | Herramienta / Framework | Propósito en el Proyecto |
| :--- | :--- | :--- |
| **Backend Core** | Node.js, Express, TypeScript | Construcción de la API REST y tipado estricto. |
| **Motores Externos** | API de Diccionario, API de Tatoeba | Obtención de definiciones formales, fonética y oraciones bilingües de ejemplo reales. |
| **Clasificación asistida** | Hugging Face Inference (zero-shot) | Sugerencia de etiqueta (`aiTag`) por palabra, siempre revisable por el usuario. |
| **Base de Datos** | MongoDB (Atlas / AWS) | Almacenamiento flexible de esquemas y metadatos. |
| **Frontend Web** | React, Vite, TypeScript | Interfaz de escritorio rápida y reactiva. |
| **Frontend Móvil** | React Native, Expo, TypeScript | Aplicación móvil multiplataforma. |
| **Infraestructura** | AWS (EC2, VPC, IAM, Security Groups) | Alojamiento seguro y control de tráfico. |

---

## 4. Gestión de Datos y Categorización (Enfoque Manual Asistido)

El sistema mantiene el control estructural en manos del usuario: las carpetas y las etiquetas
planas son siempre manuales e intencionales. Como apoyo, un modelo de clasificación de
Hugging Face sugiere una etiqueta adicional por palabra (`aiTag`). Esta sugerencia se almacena
en un campo independiente, nunca sustituye ni se mezcla con las decisiones del usuario.

### 4.1 Modelo de datos (MongoDB)

**Colección `words`**

* **Contenido:** `term` (término principal), `translation` (traducción validada) y `sourceLang`
  (`en` | `es`).
* **Frases de contexto (`contextSentences`):** array de hasta 10 oraciones de ejemplo por palabra.
  Cada elemento guarda el texto, su idioma, un array `translations` (una frase puede tener varias
  traducciones válidas), la fuente (`tatoeba` | `mymemory` | `manual`), el identificador de la
  frase en la fuente y los datos de atribución (`owner`, `license`).
* **Organización:** `folders` (array de referencias a carpetas), `tags` (etiquetas manuales) y
  `aiTag` (etiqueta sugerida por IA, opcional).
* **Metadatos:** `createdAt` y `updatedAt` generados automáticamente.

**Colección `folders`**

* **Estructura en árbol:** cada carpeta guarda un `parentId` que referencia a su carpeta padre
  (`null` para las carpetas raíz). Permite anidar carpetas sin límite de niveles.
* **Tipo de medio (`mediaType`):** texto libre normalizado a minúsculas (ej. película, libro,
  canción, podcast), sin lista cerrada, de modo que el usuario puede crear categorías nuevas
  sin modificar el código.
* **Reglas de integridad:** no se permite borrar una carpeta que tenga subcarpetas (error 409);
  al borrar una carpeta, sus referencias se eliminan de todas las palabras que la usaban.

**Relaciones:** palabra y carpeta mantienen una relación de muchos a muchos mediante referencias
(una palabra puede estar en varias carpetas). Las frases de contexto van embebidas en la
palabra, ya que no tienen sentido fuera de ella.

### 4.2 Sistemas de clasificación

Cada palabra se puede localizar por tres vías complementarias:

* **Carpetas (dónde vive):** árbol jerárquico de contenedores personalizados según los intereses
  reales del usuario (ej. "Película: Interstellar", "Libro: Clean Code", "Canción: Let It Be").
  Es el eje de navegación.
* **Etiquetas manuales (qué es):** etiquetas planas administradas por el usuario (ej. *verbos*,
  *técnico*, *familia*), normalizadas a minúsculas. Permiten búsquedas cruzadas entre carpetas.
* **Etiqueta de IA (`aiTag`):** sugerencia generada mediante clasificación zero-shot con el
  modelo multilingüe `joeddav/xlm-roberta-large-xnli`, consumido a través de la Inference API
  de Hugging Face. Las etiquetas candidatas son las etiquetas manuales ya existentes más un
  conjunto base. Se clasifica el término junto con su primera frase de contexto para reducir
  la ambigüedad. Si la API falla o se agota la cuota, la palabra se guarda con `aiTag` vacío
  sin interrumpir el flujo. La etiqueta de IA es solo una sugerencia, el usuario puede
  ignorarla.

### 4.3 Fuentes de contexto

* **Tatoeba (fuente principal de ejemplos):** búsqueda de oraciones que contienen el término,
  con traducciones asociadas, filtrando frases no aprobadas y limitando su longitud. Se
  conservan autoría y licencia para cumplir con la atribución.
* **MyMemory (apoyo a la traducción):** se utiliza para proponer la traducción del término y
  para traducir frases de Tatoeba que carezcan de traducción en el idioma destino. Al ser una
  memoria de traducción y no un buscador de frases, no se emplea como fuente de ejemplos.
* **Caché:** los resultados se persisten en MongoDB tras la primera consulta para no repetir
  llamadas a las APIs externas ni agotar sus cuotas.

### 4.4 Búsqueda y visualización

Un único endpoint de listado de palabras combina filtros opcionales (carpeta, inclusión de
subcarpetas, etiqueta manual, `aiTag`, idioma y texto libre). La inclusión de subcarpetas se
resuelve calculando los descendientes de la carpeta con `$graphLookup`. Se definen índices sobre
`folders`, `tags`, `aiTag` y un índice de texto sobre `term` y `translation`.

En el cliente, el árbol de carpetas se muestra como panel de navegación lateral, y las
etiquetas (manuales y de IA, diferenciadas visualmente) como filtros superiores combinables
con la carpeta seleccionada.
---

## 5. Fases de Desarrollo y Cronograma

Considerando una disponibilidad de **4 horas diarias en días laborales** (lunes a viernes, equivalente a 20 horas semanales), el ciclo de vida del proyecto se divide en 5 fases estructuradas a lo largo de 8 semanas:

## 5. Fases de Desarrollo y Cronograma

Considerando una disponibilidad de **4 horas diarias en días laborales** (lunes a viernes, equivalente a 20 horas semanales), el ciclo de vida del proyecto se divide en 6 fases estructuradas a lo largo de 10 semanas:

| Fase | Denominación | Duración Estimada | Horas Totales | Entregables Clave |
| --- | --- | --- | --- | --- |
| **Fase 0** | **Diseño y Preparación** | 0,5 Semanas | 10 Horas | Monorepo pnpm en GitHub, tablero de proyecto con Issues y Milestones por fase, wireframes en Figma (baja fidelidad de todas las pantallas y alta fidelidad de 3-4 pantallas núcleo) y diseño preliminar del esquema de datos. |
| **Fase 1** | **Backend Core y Conectores** | 3 Semanas | 60 Horas | Entorno Node.js/TypeScript/Express con Vitest y Supertest, conexión a MongoDB Atlas, modelos `Word` y `Folder` (árbol con `parentId`), CRUD de carpetas con reglas de integridad, CRUD de palabras, endpoint de búsqueda con filtros combinables e índices, clientes de Tatoeba y del diccionario, servicio de clasificación `aiTag` con Hugging Face, caché de respuestas externas y tests con mocks de los servicios externos. |
| **Fase 2** | **Desarrollo del Frontend Web** | 2,5 Semanas | 50 Horas | Inicialización de React + Vite con TypeScript, árbol de carpetas como panel lateral, barra de filtros combinables (etiquetas manuales, `aiTag`, idioma, texto), `WordCard` con varias frases de contexto y sus traducciones, flujo de "añadir palabra" con sugerencia de etiqueta y conexión con la API local. |
| **Fase 3** | **Despliegue e Infraestructura en AWS** | 1 Semana | 20 Horas | Configuración de cuenta AWS, creación de una VPC segura, aprovisionamiento de una instancia EC2, despliegue del servidor Node.js en la nube y configuración de variables de entorno y bases de datos remotas. |
| **Fase 4** | **Desarrollo de la Aplicación Móvil** | 2 Semanas | 40 Horas | Creación del entorno React Native con Expo, navegación por niveles de carpetas, pantalla de repaso rápido, consumo de la API alojada en AWS y pruebas en dispositivo físico. |
| **Fase 5** | **Integración, Pruebas y Pulido** | 1 Semana | 20 Horas | Pruebas de integración de extremo a extremo (E2E), manejo de excepciones ante fallos o agotamiento de cuota de las APIs externas, optimización de consultas a base de datos y documentación final del repositorio. |

El tiempo total estimado de desarrollo asciende a **200 horas efectivas**, culminando en un producto mínimo viable (MVP) completamente funcional, desplegado en la nube y accesible tanto desde navegadores web como desde dispositivos móviles.
