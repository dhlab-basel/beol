import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DataGraphDB } from '../services/beol.service';
import * as L from 'leaflet';
import 'leaflet-arrowheads';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnChanges {
    @Input() mapData: DataGraphDB;
    map: any;
    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.initMap();
    }

    private initMap() {
        const origin = this.get_origin()
        const destination = this.get_destination()
        const centroid = this.calculate_center(origin, destination)
        this.loadMap(centroid);
        this.addMarkers(origin, destination);
        this.addLines();
    }

    private get_origin(): L.LatLng {
        const latitude = this.mapData.results.bindings[0].startLat.value
        const longitude = this.mapData.results.bindings[0].startLong.value
        return new L.LatLng(latitude, longitude)
    }

    private get_destination(): L.LatLng {
        const length = this.mapData.results.bindings.length
        const lastObject = this.mapData.results.bindings[length-1]
        const latitude = lastObject.endLat.value
        const longitude = lastObject.endLong.value
        return new L.LatLng(latitude, longitude)
    }
    private calculate_center(origin: L.LatLng, destination: L.LatLng): L.LatLng {
        const middle_point_lat = (origin.lat + destination.lat)/2
        const middle_point_lng = (origin.lng + destination.lng)/2
        return new L.LatLng(middle_point_lat, middle_point_lng)
    }

    private loadMap(centroid: L.LatLngExpression): void {
        this.map = L.map('map', {center: centroid, zoom: 8.4});
        const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: environment.mapbox.accessToken,
        })
        tiles.addTo(this.map);
    }

    private addMarkers(origin_coord: L.LatLng, destination_coord: L.LatLng): void {
        const origin = L.marker(origin_coord, {
            icon: new L.Icon({
                iconSize: new L.Point(40, 40),
                iconAnchor: [13, 41],
                iconUrl: 'assets/images/red_marker.svg',
            }), title: 'Workspace'
        } as L.MarkerOptions);
        origin.addTo(this.map);

        const destination = L.marker(destination_coord, {
            icon: new L.Icon({
                iconSize: new L.Point(40, 40),
                iconAnchor: [13, 41],
                iconUrl: 'assets/images/blue_marker.svg',
            }), title: 'Workspace'
        } as L.MarkerOptions);
        destination.addTo(this.map);
    }

    private addLines(): void {
        this.mapData.results.bindings.forEach((obj, index) => {
            const start =  new L.LatLng(obj.startLat.value, obj.startLong.value)
            const end = new  L.LatLng(obj.endLat.value, obj.endLong.value)
            const line = L.polyline([start, end], {
                color: '#800080'
            } as L.PolylineOptions).arrowheads({size: '15%'});
            line.addTo(this.map)
        })
    }
}
