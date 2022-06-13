// ==UserScript==
// @name        Calculate Cost Basis in Computershare
// @description Calculates the total shares purchased and cost basis in the Investor Center for Computershare.
// @author      Isaac Corbrey
// @namespace   Violentmonkey Scripts
// @match       https://www-us.computershare.com/Investor/Accounts/AvailableShares
// @grant       none
// @version     1.0
// ==/UserScript==

/**
 * @typedef {Object} DirtyEntry
 * @property {string} DirtyEntry.costBasis
 * @property {string} DirtyEntry.shareCount
 */

/**
 * @typedef {Object} Entry
 * @property {number} Entry.costBasis
 * @property {number} Entry.shareCount
 */

/**
 * @returns {HTMLTableRowElement[]}
 */
const getTableRows = () =>
	Array.from(document.querySelectorAll('#SharelotGrid > table > tbody > tr'));

/**
 * 
 * @returns {HTMLTable}
 */
const getTableBody = () =>
	document.querySelector('#SharelotGrid > table > tbody');

/**
 * 
 * @param {HTMLTableRowElement} row 
 * @returns {HTMLTableCellElement[]}
 */
const toRowCells = (row) =>
	Array.from(row.getElementsByTagName('td'));

/**
 * 
 * @param {HTMLTableCellElement[]} cells 
 * @returns {DirtyEntry}
 */
const toDirtyEntry = (cells) => ({
	costBasis: cells[3].textContent.trim(),
	shareCount: cells[4].textContent.trim(),
})

/**
 * 
 * @param {DirtyEntry} entry 
 * @returns {boolean}
 */
const isValidEntry = (entry) =>
	entry.costBasis !== 'N/A';

/**
 * 
 * @param {string} str 
 * @returns {string}
 */
const stripDollarSign = (str) =>
	str.startsWith('$')
		? str.slice(1)
		: str;

/**
 * 
 * @param {DirtyEntry} entry 
 * @returns {Entry}
 */
const parseEntry = (entry) => ({
	costBasis: Number.parseFloat(stripDollarSign(entry.costBasis)),
	shareCount: Number.parseFloat(entry.shareCount),
})

/**
 * 
 * @param {Entry} x 
 * @param {Entry} y 
 * @returns {Entry}
 */
const toTotalEntry = (x, y) => ({
	costBasis: x.costBasis + y.costBasis,
	shareCount: x.shareCount + y.shareCount,
})

/**
 * @param {DirtyEntry} entry 
 * @returns {number}
 */
const toShareCount = (entry) =>
	Number.parseFloat(entry.shareCount)

/**
 * @param {number} x 
 * @param {number} y 
 * @returns {number}
 */
const toSum = (x, y) =>
	x + y

/**
 * 
 * @returns {DirtyEntry}[]
 */
const getEntries = () =>
	getTableRows()
		.map(toRowCells)
		.map(toDirtyEntry)

/**
 * @param {DirtyEntry[]}
 * @returns {Entry}
 */
const getTotals = (entries) =>
	entries
		.filter(isValidEntry)
		.map(parseEntry)
		.reduce(toTotalEntry)

const not = (predicate) =>
	(...args) =>
		!predicate(...args)

/**
 * 
 * @param {DirtyEntry[]} entries 
 * @returns {number}
 */
const getExcluded = (entries) =>
	entries
		.filter(not(isValidEntry))
		.map(toShareCount)
		.reduce(toSum)

/**
 * @returns {HTMLTableCellElement}
 */
const createEmptyCell = () =>
	document.createElement('td');

/**
 * @param {string} text
 * @param {string=} className
 * @returns {HTMLTableCellElement}
 */
const createBoldedCell = (text, className) =>
{
	const cell = createEmptyCell()

	if (!!className)
	{
		cell.setAttribute('class', className);
	}

	const bold = document.createElement('b')
	bold.textContent = text
	cell.appendChild(bold);
	return cell;
}

/**
 * @returns {HTMLTableCellElement}
 */
const createTotalCell = () =>
	createBoldedCell('Total');

/**
 * @param {number} costBasis
 * @returns {HTMLTableCellElement}
 */
const createTotalCostBasisCell = (costBasis) =>
	createBoldedCell(`$${costBasis.toFixed(2)}`, 'cost-basis');

/**
 * @param {number} shareCount
 * @returns {HTMLTableCellElement}
 */
const createTotalSharesCell = (shareCount) =>
	createBoldedCell(shareCount.toFixed(6), 'numeric');

/**
 * @param {number} shareCount
 * @returns {HTMLTableCellElement}
 */
const createExcludedSharesCell = (shareCount) =>
	createBoldedCell(`(${shareCount.toFixed(6)})`, 'numeric');

/**
 * @param {Entry} totals 
 * @returns {HTMLTableRowElement}
 */
const createTotalRow = (totals) =>
{
	const row = document.createElement('tr')
	row.append(
		createTotalCell(),
		createEmptyCell(),
		createEmptyCell(),
		createTotalCostBasisCell(totals.costBasis / totals.shareCount),
		createTotalSharesCell(totals.shareCount),
		createEmptyCell()
	)
	return row;
}

/**
 * @returns {HTMLTableCellElement}
 */
const createExcludedCell = () =>
	createBoldedCell('Excluded');

/**
 * @param {number} excluded 
 * @returns {HTMLTableRowElement}
 */
const createExcludedRow = (excluded) =>
{
	const row = document.createElement('tr')
	row.append(
		createExcludedCell(),
		createEmptyCell(),
		createEmptyCell(),
		createEmptyCell(),
		createExcludedSharesCell(excluded),
		createEmptyCell()
	)
	return row;
}

const displayTotalCostBasis = () =>
{
	const entries = getEntries();
	getTableBody().append(
		createTotalRow(getTotals(entries)),
		createExcludedRow(getExcluded(entries)),
	)
}

displayTotalCostBasis();
