import { Component, Input } from '@angular/core';


@Component({
    standalone: true,
    selector: 'app-spinner-ico',
    templateUrl: './spinner-icon.component.svg',
})
export class SpinnerIconComponent {

    @Input({ required: true })
    size!: number;

    @Input()
    color = 'black';
}
