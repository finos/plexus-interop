import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class SubsctiptionsRegistry {
    private subscriptions: Subscription[] = [];

    public add(...subscriptions: Subscription[]): void {
        subscriptions.forEach(s => this.subscriptions.push(s));
    }

    public unsubscribeAll(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}