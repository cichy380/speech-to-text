import { Component, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-mic-ico',
    templateUrl: './mic-icon.component.svg',
})
export class MicIconComponent {

    @Input({ required: true })
    size!: number;

    @Input()
    color = 'black';
}