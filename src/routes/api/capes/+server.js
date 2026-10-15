import { json } from '@sveltejs/kit';

const capes = [
	{
		id: 'geologia-general',
		nom: 'Mapa geològic general',
		descripcio: 'Cartografia geològica del servei de mapa base de l’ICGC.',
		organisme: 'Institut Cartogràfic i Geològic de Catalunya',
		urlInformacio: 'https://www.icgc.cat/ca/Geoinformacio-i-mapes/Servei-de-Mapa-Base',
		tipusServei: 'WMS',
		consultable: false,
		urlLlegenda:
			'https://geoserveis.icgc.cat/vector02/rest/services/mapa_base_geologic/MapServer/legend',
		urlTesselles:
			'https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=geologic&STYLES=&FORMAT=image/png&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256',
		atribucio:
			'Catalunya © ICGC (CC BY) · Resta del món © OpenMapTiles © OpenStreetMap contributors'
	}
];

export function GET() {
	return json(capes);
}
