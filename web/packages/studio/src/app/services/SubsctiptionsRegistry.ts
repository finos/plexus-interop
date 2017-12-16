import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class SubsctiptionsRegistry {
    private subscriptions: Subscription[] = [];

    public add(subscription: Subscription): void {
        this.subscriptions.push(subscription);
    }

    public unsubscribeAll(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}