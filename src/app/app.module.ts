import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';


import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import { AppComponent } from './app.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TemplatesComponent } from './components/templates/templates.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EditSubscriberComponent } from './components/settings/edit-subscriber/edit-subscriber.component';
import { ConfirmPopupComponent } from './components/confirm-popup/confirm-popup.component';
import { MessageWindowComponent } from './components/order-list/message-window/message-window.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { OrderDetailsComponent } from './components/order-list/order-details/order-details.component';

import {PhoneFormatPipe} from '../app/pipes/phone'


@NgModule({
  declarations: [
    AppComponent,
    OrderListComponent,
    TemplatesComponent,
    SettingsComponent,
    EditSubscriberComponent,
    ConfirmPopupComponent,
    MessageWindowComponent,
    SnackbarComponent,
    OrderDetailsComponent,
    PhoneFormatPipe,

  ],
  imports: [
    BrowserModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatCardModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatSlideToggleModule,
    BrowserAnimationsModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatSelectModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
