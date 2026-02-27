# RPI-SEISM Web

Angular‑based real‑time dashboard for the [rpi‑seism](https://github.com/ch3p4ll3/rpi-seism) seismometer system.  
Connects to the Raspberry Pi WebSocket server to display live seismic waveforms and their frequency spectra (FFT).

---

## Features

- **Live waveform display** – 3‑channel (EHZ, EHN, EHE) time series with a sliding window.
- **Real‑time FFT spectrum** – frequency domain view computed from the latest 512 samples.
- **WebSocket integration** – receives decimated data (25 Hz default) from the rpi‑seism backend.
- **Responsive charts** – built with PrimeNG Chart (Chart.js wrapper) and customised for seismology.
- **Automatic channel discovery** – dynamically adds channels as they appear in the data stream.

---

## Dependencies

- [Angular](https://angular.io/) 21 (standalone components)
- [PrimeNG](https://primeng.org/) – UI component library (Chart module)
- [Chart.js](https://www.chartjs.org/) – underlying charting library
- [fft.js](https://github.com/indutny/fft.js) – fast Fourier transform for real‑time spectrum analysis

---

## Installation

### Prerequisites

- Node.js 18+ and npm
- Angular CLI (optional, for development)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ch3p4ll3/rpi-seism-web.git
   cd rpi-seism-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the WebSocket endpoint (optional)  
   By default, the application connects to `ws://localhost:8765`.  
   If your rpi‑seism backend runs on a different IP or port, modify the `WebsocketService` (see `src/app/services/websocket-service.ts`) or set it via environment variables.

4. Start the development server:
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200`. The app will automatically reload if you change any source files.

### Building for Production

To create a production build:
```bash
ng build --configuration production
```
The output will be in the `dist/` directory. You can serve these static files with any web server (e.g., nginx, Apache) and point them to your running rpi‑seism WebSocket server.

---

## Usage

Once the application is running and the rpi‑seism backend is active, the dashboard will:

- Establish a WebSocket connection.
- Wait for incoming `SensorData` messages.
- For each channel, display:
  - A **waveform chart** (time domain) showing the last ~5 seconds of data (512 points).
  - An **FFT spectrum** (frequency domain) computed from the same 512‑point window.

The charts update automatically as new data arrives.

---

## Data Format

The WebSocket expects messages in the following JSON format (matching the `SensorData` entity):

```json
{
  "channel": "EHZ",
  "timestamp": "2025-03-23T12:34:56.789Z",
  "fs": 25,
  "data": [123, 125, ...]
}
```

- `channel` – string identifier (e.g., `EHZ`, `EHN`, `EHE`)
- `timestamp` – ISO 8601 timestamp of the last sample
- `fs` – sampling frequency of the **decimated** data (e.g., 25 Hz)
- `data` – array of integer/float values (new samples since last update)

The backend (rpi‑seism) sends updates every second with a batch of decimated samples.

---

## Project Structure

```
rpi-seism-web/
├── src/
│   ├── app/
│   │   ├── dashboard/               # Main dashboard component
│   │   │   ├── dashboard.html        # Template
│   │   │   └── dashboard.ts          # Component logic (chart updates, FFT)
│   │   ├── entities/
│   │   │   └── sensor_data.ts        # SensorData interface
│   │   ├── services/
│   │   │   └── websocket-service.ts  # WebSocket connection handling
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
└── README.md
```

---

## Customisation

### Chart Appearance

Chart options are defined in `dashboard.ts` (`initChartOptions()`).  
You can adjust colours, axes, grid lines, and FFT scale (linear/logarithmic) to suit your preferences.

### FFT Window Size

The FFT uses a 512‑point window (`MAX_POINTS`). Change this constant to trade off frequency resolution vs. responsiveness.  
(Note: 512 is a power of two, required by `fft.js`.)

### WebSocket URL

Modify the WebSocket URL in `websocket-service.ts` if your backend runs on a different host/port.

---

## Integration with rpi‑seism

This frontend is designed to work seamlessly with the [rpi‑seism](https://github.com/ch3p4ll3/rpi-seism) backend.  
The backend’s `WebSocketSender` thread sends decimated data exactly in the format expected by this Angular app.

Make sure the backend is running and the WebSocket server is enabled (default port `8765`).

---

## Troubleshooting

- **No data / charts empty**  
  - Check that the rpi‑seism backend is running and the WebSocket server is active.  
  - Verify the WebSocket URL in the service matches your backend’s IP/port.  
  - Open the browser’s developer console to see if there are connection errors.

- **FFT not updating**  
  - Ensure enough samples have been received (at least `MAX_POINTS`).  
  - The FFT computation runs inside the Angular zone; check for any JavaScript errors.

- **Chart rendering performance**  
  - Reducing `MAX_POINTS` or the number of displayed channels can improve performance on low‑power devices.  
  - Consider enabling `production` mode in Angular (`enableProdMode()`).

---

## License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.

---

## Links

- [rpi‑seism (backend)](https://github.com/ch3p4ll3/rpi-seism) – Raspberry Pi data acquisition software.
- [rpi‑seism‑reader](https://github.com/ch3p4ll3/rpi-seism-reader) – Arduino firmware for the geophone digitizer.

---

## Acknowledgements

- Built with [Angular](https://angular.io/) and [PrimeNG](https://primeng.org/).
- FFT computation by [fft.js](https://github.com/indutny/fft.js).