import { Component, OnInit } from '@angular/core';
import { ItemService } from '../services/item.service';
import { Item } from '../models/Item';
import { Bid } from '../models/Bids';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  item: Item = null;
  currentBid: Bid = null;
  error = '';
  message = '';
  poll = null;
  subscription = null;
  constructor(private itemService: ItemService) { }

  ngOnInit() {
    this.poll = interval(2000)
      .pipe(
        startWith(0),
        switchMap(() => this.itemService.getCurrentItem()
        )
      )
    this.subscription = this.poll.subscribe(
      (item) => {
        if (item['status'] === 'success') {
          this.error = '';
          if (!item['data']) {
            this.message = item['message'];
            this.item = null;
          } else {
            this.item = (item['data'] !== this.item) ? item['data'] : this.item;
            this.message = '';
            this.itemService.getCurrentBid(this.item.id).subscribe(
              (bid) => {
                if (!bid['data']) {
                  this.message = bid['message'];
                  this.currentBid = null;
                } else {
                  this.currentBid = bid['item'];
                  this.message = '';
                }
              },
              (err) => {
                // this.error = item['message'];
              }
            );
          }
        }
        else
          this.error = item['message'];
      },
      (err) => {
        this.error = err['message'];
        this.message = '';
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
