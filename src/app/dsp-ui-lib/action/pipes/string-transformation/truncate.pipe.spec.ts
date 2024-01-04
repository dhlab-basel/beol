import { TruncatePipe } from './truncate.pipe';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('TruncatePipe', () => {
    let pipe: TruncatePipe;
    let snippet: string;

    beforeEach(() => {
        pipe = new TruncatePipe();
        snippet = 'The quick brown fox jumps over the lazy dog.';
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should truncate after 15 characters', () => {
        const truncatedSnippet = pipe.transform(snippet, 15);
        expect(truncatedSnippet).toEqual('The quick brown...');
    });

    it('should truncate after 19 characters and add an exclamation mark at the end', () => {
        const truncatedSnippet = pipe.transform(snippet, 19, '!');
        expect(truncatedSnippet).toEqual('The quick brown fox!');
    });

    it('should truncate after 20 characters by default', () => {
        const truncatedSnippet = pipe.transform(snippet);
        expect(truncatedSnippet).toEqual('The quick brown fox ...');
    });

    it('should support the limit argument in the template', () => {
        @Component({
          template: `{{ text | dspTruncate:4 }}`,
        })
        class App {
          text = 'This is my string';
        }

        TestBed.configureTestingModule({declarations: [App, TruncatePipe]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('This...');
    });

    it('should support the trail argument in the template', () => {
        @Component({
          template: `{{ text | dspTruncate:7:'!!' }}`,
        })
        class App {
          text = 'This is my string';
        }

        TestBed.configureTestingModule({declarations: [App, TruncatePipe]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('This is!!');
    });
});
