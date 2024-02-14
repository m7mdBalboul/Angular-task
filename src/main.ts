import { isDevMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';

async function prepareApp() {
  if (isDevMode()) {
    const { worker } = await import('@db/mocks.browser');
    return worker.start();
  }

  return Promise.resolve();
}

prepareApp().then(() => {
  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err)
  );
});
