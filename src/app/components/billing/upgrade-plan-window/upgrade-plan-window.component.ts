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

  constructor(public server: BackendServerService,
    public dialogRef: MatDialogRef<UpgradePlanWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.plan = data;
  }

  ngOnInit(): void {
  }

  upgrade() {
    this.confirmUpgrade = true;
    this.server.upgradePlan(this.plan).subscribe(value => {
      this.planUpgrade = value.body;
    });
  }

  closeDialogue() {
    this.dialogRef.close();
  }

}
