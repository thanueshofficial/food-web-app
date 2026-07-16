# Forkful — Food Ordering Web App

A simple, good-looking food ordering frontend: browse the menu, add items to
a cart, and check out through a billing page that prints a receipt. Pure
HTML/CSS/JS (no build step, no framework) with cart state persisted in
`localStorage`, plus Docker, Kubernetes, and Jenkins files to ship it.

## Pages

| Page          | File          | What it does                                   |
|---------------|---------------|-------------------------------------------------|
| Home          | `index.html`  | Hero + featured dishes + category shortcuts     |
| Menu          | `menu.html`   | Full menu, filterable by category, add to cart  |
| Cart          | `cart.html`   | Review items, adjust quantity, see order total  |
| Checkout      | `billing.html`| Delivery + payment form → order receipt         |

Navigation between pages is plain `<a href="...">` links; the cart badge and
totals update live via `assets/js/app.js`.

## Run it locally

No build tools needed — it's static HTML.

```bash
# option 1: just open it
open index.html

# option 2: serve it (recommended, avoids file:// quirks)
npx serve .
# or
python3 -m http.server 8080
```

## Run with Docker

```bash
docker build -t forkful-app .
docker run -p 8080:8080 forkful-app
# visit http://localhost:8080
```

## Deploy to Kubernetes

1. Push the image to a registry:
   ```bash
   docker tag forkful-app <your-dockerhub-username>/forkful-app:latest
   docker push <your-dockerhub-username>/forkful-app:latest
   ```
2. Update `k8s/deployment.yaml` — replace `<YOUR_DOCKERHUB_USERNAME>` with your image path.
3. Apply the manifests:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   kubectl apply -f k8s/ingress.yaml
   ```
4. Update `k8s/ingress.yaml`'s `host` to your real domain, or `kubectl port-forward svc/forkful-service 8080:80` to test locally.

## CI/CD with Jenkins

The included `Jenkinsfile` does: checkout → basic file checks → build Docker
image → push to Docker Hub → deploy to Kubernetes via `kubectl`.

Set these up first in Jenkins (**Manage Jenkins → Credentials**):
- `dockerhub-username` — secret text, your Docker Hub username
- `dockerhub-credentials` — username/password credential for Docker Hub
- A Jenkins agent with `docker` and `kubectl` installed and configured against your cluster

## Project structure

```
food-ordering-app/
├── index.html
├── menu.html
├── cart.html
├── billing.html
├── assets/
│   ├── css/style.css
│   └── js/app.js
├── Dockerfile
├── nginx.conf
├── Jenkinsfile
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── .dockerignore
└── .gitignore
```

## Notes

- Food photos are hotlinked from Unsplash for demo purposes — swap in your
  own images under `assets/img/` and update the `img` field in
  `assets/js/app.js`'s `MENU` array for production use.
- Cart data lives in the browser's `localStorage`, so it's per-browser, not
  shared across devices — wire it up to a real backend/database for a
  production app.
