/**
 * @typedef {object} Capa
 * @property {string} id
 * @property {string} nom
 * @property {'raster' | 'punts'} tipus
 * @property {boolean} visible
 * @property {number} opacitat
 * @property {boolean} visibleInicial
 * @property {number} opacitatInicial
 * @property {string} descripcio
 * @property {string} organisme
 * @property {string} urlInformacio
 * @property {string} urlLlegenda
 * @property {string} urlTesselles
 * @property {string} atribucio
 */

/** @returns {Capa} */
export function crearCapaPunts() {
	return {
		id: 'punts-prova',
		nom: 'Punts de prova',
		tipus: 'punts',
		visible: true,
		opacitat: 100,
		visibleInicial: true,
		opacitatInicial: 100,
		descripcio: 'Coordenades aproximades de ciutats, sense valor d’inventari.',
		organisme: '',
		urlInformacio: '',
		urlLlegenda: '',
		urlTesselles: '',
		atribucio: ''
	};
}

/** @param {unknown} valor */
export function esOpacitatValida(valor) {
	return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 && valor <= 100;
}

/** @param {unknown} valor @returns {valor is Record<string, unknown>} */
function esObjecte(valor) {
	return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/** @param {unknown} valor @returns {valor is string} */
function esText(valor) {
	return typeof valor === 'string' && valor.trim().length > 0;
}

/** @param {unknown} valor @returns {valor is string} */
function esUrlHttps(valor) {
	if (!esText(valor)) return false;
	try {
		const url = new URL(valor);
		return url.protocol === 'https:' && url.username === '' && url.password === '';
	} catch {
		return false;
	}
}

/**
 * Valida la resposta abans de substituir el catàleg. Una llista buida és vàlida.
 * @param {unknown} dades
 * @returns {Capa[]}
 */
export function validarCataleg(dades) {
	if (!Array.isArray(dades)) {
		throw new Error('El catàleg ha de contenir una llista de capes.');
	}
	const identificadors = new Set(['punts-prova']);
	return dades.map((entrada, index) => {
		if (!esObjecte(entrada)) {
			throw new Error(`La capa ${index + 1} no és un objecte vàlid.`);
		}
		const { id, nom, descripcio, organisme, urlInformacio, urlLlegenda, urlTesselles, atribucio } =
			entrada;
		if (!esText(id) || !/^[a-z][a-z0-9-]*$/.test(id) || identificadors.has(id)) {
			throw new Error(`La capa ${index + 1} té un identificador invàlid o repetit.`);
		}
		if (!esText(nom) || !esText(descripcio) || !esText(organisme) || !esText(atribucio)) {
			throw new Error(`Falten metadades a la capa «${id}».`);
		}
		if (!esUrlHttps(urlInformacio) || !esUrlHttps(urlLlegenda) || !esUrlHttps(urlTesselles)) {
			throw new Error(`La capa «${id}» ha de tenir adreces HTTPS vàlides, sense credencials.`);
		}
		const peticio = new URL(urlTesselles);
		if (
			entrada.tipusServei !== 'WMS' ||
			peticio.searchParams.get('REQUEST')?.toLowerCase() !== 'getmap' ||
			peticio.searchParams.get('SRS') !== 'EPSG:3857' ||
			peticio.searchParams.get('BBOX') !== '{bbox-epsg-3857}' ||
			peticio.searchParams.get('WIDTH') !== '256' ||
			peticio.searchParams.get('HEIGHT') !== '256'
		) {
			throw new Error(`La capa «${id}» no té una plantilla WMS compatible amb el visor.`);
		}
		const visibleInicial = entrada.visibleInicial ?? false;
		const opacitatInicial = entrada.opacitatInicial ?? 70;
		if (typeof visibleInicial !== 'boolean' || !esOpacitatValida(opacitatInicial)) {
			throw new Error(`Els valors inicials de la capa «${id}» no són vàlids.`);
		}
		identificadors.add(id);
		return {
			id,
			nom,
			descripcio,
			organisme,
			urlInformacio,
			urlLlegenda,
			urlTesselles,
			atribucio,
			tipus: 'raster',
			visible: visibleInicial,
			opacitat: /** @type {number} */ (opacitatInicial),
			visibleInicial,
			opacitatInicial: /** @type {number} */ (opacitatInicial)
		};
	});
}

/** @param {string} text */
export function normalitzarText(text) {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();
}

/** @param {Capa[]} capes @param {string} cerca */
export function cercarCapes(capes, cerca) {
	const consulta = normalitzarText(cerca);
	return capes.filter((capa) => normalitzarText(capa.nom).includes(consulta));
}

/** @param {Capa} capa */
export function restablirCapa(capa) {
	capa.visible = capa.visibleInicial;
	capa.opacitat = capa.opacitatInicial;
}
