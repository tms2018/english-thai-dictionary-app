import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
import { MyApp } from "./app.component";

import { HomePage } from "../pages/home/home";

import { CollapsibleCardComponent } from '../components/collapsible-card/collapsible-card';

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import { SQLite } from "@ionic-native/sqlite";
import { DatabaseProvider } from "../providers/database/database";
import { NlpProvider } from '../providers/nlp/nlp';

@NgModule({
  declarations: [MyApp, HomePage, CollapsibleCardComponent],
  imports: [BrowserModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    SplashScreen,
    SQLite,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DatabaseProvider,
    NlpProvider
  ]
})
export class AppModule { }
