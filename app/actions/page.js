export const PAGE_ONLINE = 'PAGE_ONLINE';
export const PAGE_OFFLINE = 'PAGE_OFFLINE';

export function pageOnline(status) {
	var type = status ? PAGE_ONLINE : PAGE_OFFLINE;

	return {
		type,
		status
	};
}