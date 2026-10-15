# Mis tareas · Expo

Aplicación de tareas para Android e iOS, adaptada del ejemplo nativo de clase con Expo SDK 58, React Native y TypeScript.

Permite crear, listar, editar, cancelar y eliminar tareas. Cada tarea tiene un nombre obligatorio y una descripción opcional. Los datos se guardan localmente con AsyncStorage y se recuperan al volver a abrir la aplicación. No requiere servidor ni cuentas de usuario.

## Preparar el proyecto

Instala Node.js LTS (22.18 o posterior), Git y Expo Go para Android. Para probar con un emulador necesitas Android Studio y un dispositivo virtual configurado.

```sh
git clone https://github.com/rubenyh/todo-expo-app.git
cd todo-expo-app
npm ci
```

El proyecto se ejecuta desde la raíz del repositorio; no hay que entrar en una subcarpeta `app`.

## Ejecutar en Android

Con un emulador encendido o un teléfono disponible:

```sh
npm run android
```

Para un teléfono conectado por USB, activa **Opciones de desarrollador → Depuración USB**, conecta el cable y acepta la autorización de la computadora en el teléfono. Después:

```sh
npm run android:usb
```

Este comando usa localhost para conectar con el servidor a través del cable. Si hace falta establecer el reenvío manualmente, ejecuta `adb reverse tcp:8081 tcp:8081` y vuelve a abrir el proyecto. `adb` debe estar disponible desde Android SDK Platform-Tools.

Mantén la terminal abierta mientras usas Expo Go. Guarda los cambios de código para actualizar la app; pulsa Ctrl+C en la terminal para detener el servidor.

En PowerShell, si aparece un bloqueo de scripts, usa `npm.cmd` y `npx.cmd` en lugar de `npm` y `npx`. Si Expo no detecta el SDK, configura `ANDROID_HOME` con la ubicación de Android SDK mostrada por Android Studio y añade `platform-tools` al Path.

Expo Go y el proyecto deben usar versiones compatibles. Los errores `ENOSPC` o «Espacio en disco insuficiente» requieren liberar espacio en la computadora antes de volver a intentar la instalación.

## Estructura

| Archivo | Responsabilidad |
| --- | --- |
| `index.ts` | Registra el componente principal con Expo. |
| `App.tsx` | Lista, formulario, estado y coordinación del guardado. |
| `src/tasks.ts` | Tipo de tarea, operaciones y validación del JSON guardado. |
| `src/taskStorage.ts` | Lectura y escritura de las tareas en AsyncStorage. |
| `tests/tasks.test.mjs` | Pruebas de operaciones y formato de datos. |
| `app.json` | Nombre, iconos e identificadores de Android/iOS. |
| `eas.json` | Perfiles de compilación. |

El guardado se confirma antes de mostrar un cambio como completado. Si falla, la aplicación informa el error. Si no se pueden leer los datos guardados, ofrece reintentar sin reemplazarlos por una lista vacía.

Los datos son locales: borrar los datos de la app o desinstalarla puede eliminarlos. Expo Go y el APK independiente tienen almacenamiento separado. AsyncStorage no es almacenamiento cifrado para secretos.

## Comprobaciones

```sh
npm test
npm run typecheck
npm run lint
```

Las pruebas automáticas cubren crear, editar, eliminar, nombres vacíos, conservación de datos al convertir a JSON y rechazo de datos dañados. No sustituyen las pruebas en un dispositivo.

Para la demostración: crea una tarea, edítala, cancela otro cambio, comprueba que un nombre vacío no puede guardarse, cierra y abre para revisar persistencia y elimina todas las tareas para mostrar el estado vacío.

## Generar paquetes

Necesitas tu propia cuenta de Expo. Desde la raíz del repositorio:

```sh
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Conserva los perfiles de `eas.json`. Para generar un APK instalable de Android:

```sh
npx eas-cli@latest build --platform android --profile preview
```

Descarga el APK cuando EAS confirme que la compilación terminó. Puedes instalarlo en un teléfono Android o arrastrarlo al emulador. El APK debe funcionar sin el servidor de desarrollo.

Para obtener un paquete `.app` de simulador iOS:

```sh
npx eas-cli@latest build --platform ios --profile ios-simulator
```

El paquete de simulador no se instala en un iPhone físico. Ejecutarlo localmente requiere macOS con Xcode. Para un IPA de distribución utiliza el perfil `production` y las credenciales correspondientes de Apple Developer:

```sh
npx eas-cli@latest build --platform ios --profile production
```

La compilación del código JavaScript, la generación de un paquete nativo y su prueba en un dispositivo son comprobaciones diferentes. Consulta las condiciones y cuotas de EAS antes de solicitar una compilación.

## Referencias

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- [Emulador de Android Studio](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Generar APK](https://docs.expo.dev/build-reference/apk/)
- [Compilaciones para simulador iOS](https://docs.expo.dev/build-reference/simulators/)
- [Requisitos de EAS Build](https://docs.expo.dev/build/setup/)
