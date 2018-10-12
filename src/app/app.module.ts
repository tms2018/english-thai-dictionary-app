import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
import { MyApp } from "./app.component";

import { SearchPage } from "../pages/search/search";
import { HomePage } from "../pages/home/home";
import { TabsPage } from "../pages/tabs/tabs";

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import { SQLite } from "@ionic-native/sqlite";
import { DatabaseProvider } from "../providers/database/database";

@NgModule({
  declarations: [MyApp, SearchPage, HomePage, TabsPage],
  imports: [BrowserModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, SearchPage, HomePage, TabsPage],
  providers: [
    StatusBar,
    SplashScreen,
    SQLite,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DatabaseProvider
  ]
})
export class AppModule {}
