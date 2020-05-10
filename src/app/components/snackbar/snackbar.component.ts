import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent implements OnInit {

  message;
  hideSpinner = true;
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
    this.message = data;
    console.log(data);
    if(data == "Uploading Data" || data ==  "Sending SMS"){
      this.hideSpinner = false;
      console.log("SHOWING SPINNER");
    }
   }

  ngOnInit(): void {
  }

}
