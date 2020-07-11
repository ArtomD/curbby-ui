import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Plan } from 'src/app/models/plan';
import { BackendServerService } from 'src/app/services/backend-server.service';

@Component({
  selector: 'app-upgrade-plan-window',
  templateUrl: './upgrade-plan-window.component.html',
  styleUrls: ['./upgrade-plan-window.component.css']
})
export class UpgradePlanWindowComponent implements OnInit {

  plan: Plan;
  planUpgrade: any;
  registerURL: string;
  confirmUpgrade: boolean = false;
  isUpgrade: boolean;

  constructor(public server: BackendServerService,
    public dialogRef: MatDialogRef<UpgradePlanWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.plan = data.plan,
      this.isUpgrade = data.upgrade
  }

  ngOnInit(): void {
  }

  upgrade() {
    this.confirmUpgrade = true;

    if (this.isUpgrade) {
      this.server.upgradePlan(this.plan).subscribe(value => {
        this.planUpgrade = value.body;
        var win = window.open(this.planUpgrade.shopifyRegistrationUrl);
        if (win) {
          win.focus();
        } else {
          alert('Please allow popups for this website');
        }
      });
    } else {
      this.server.downgradePlan(this.plan).subscribe(value => {
        this.planUpgrade = value.body;
        var win = window.open(this.planUpgrade.shopifyRegistrationUrl);
        if (win) {
          win.focus();
        } else {
          alert('Please allow popups for this website');
        }
      });
    }

  }

  closeDialogue() {
    this.dialogRef.close();
  }

}
