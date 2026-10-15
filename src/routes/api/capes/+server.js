import { json } from '@sveltejs/kit';

const capes = [
  {
    id: 'geologia-general',
    nom: 'Mapa geològic general',
    descripcio: 'Cartografia geològica del servei de mapa base de l’ICGC.',
    organisme: 'Institut Cartogràfic i Geològic de Catalunya',
    urlInformacio:
      'https://www.icgc.cat/ca/Geoinformacio-i-mapes/Servei-de-Mapa-Base',
    tipusServei: 'WMS',
    consultable: false
  }
];

export function GET() {
  return json(capes);
}