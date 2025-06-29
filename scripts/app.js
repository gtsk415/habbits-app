'use strict';

let habbits = [];
let globalActiveHabbitId;

const HABBIT_KEY = 'HABBIT_KEY';
const cover = document.querySelector('.cover');



/* page */
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		name: document.querySelector('.content__name'),
		progressName: document.querySelector('.progress__name'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar'),
	},
	content: {
		daysContainer: document.getElementById('days'),
		nextDays: document.querySelector('.habbit__day'),
		habbitForm: document.querySelector('.habbit.habbit-form'),
		
	},
	popup: {
		index: document.querySelector('.cover'),
		iconField: document.querySelector('.popup__form input[name="icon"]'),
		iconLabel: document.querySelector('.icon-label'),
	}

}

const progress = parseInt(page.header.progressPercent.innerText);

/* utils */
function loadData() {
	const habbitsString = localStorage.getItem(HABBIT_KEY);
	const habbitArray = JSON.parse(habbitsString);
	if (Array.isArray(habbitArray)) {
		habbits = habbitArray;
	}
}

function saveData() {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
	if (page.popup.index.classList.contains('cover_hidden')) {
		page.popup.index.classList.remove('cover_hidden');
	} else {
		page.popup.index.classList.add('cover_hidden');
	}
}

function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = '';
	}
}

function validateAndGetFormData(form, fields) {
	const formData = new FormData(form);
	const res = {};
	for (const field of fields) {
		const fieldValue = formData.get(field);
		form[field].classList.remove('error');

		if (!fieldValue) {
			form[field].classList.add('error');
		};

		res[field] = fieldValue;
	};

	let isValid = true;
	for (const field of fields) {
		if (!res[field]) {
			isValid = false;
		};
	};

	if (!isValid) {
		return 
	};

	return res;
}


/* render */
function rerenderMenu(activeHabbit) {
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
		if (!existed) {
			// создание
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img class="icon" src="/images/${habbit.icon}.svg" alt="${habbit.name}">`;
			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu__item_active');
			};

			page.menu.appendChild(element);
			continue;
		};

		

		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu__item_active');
		} else {
			existed.classList.remove('menu__item_active');
		};

		console.log(progress);

	};

}

function rerenderHead(activeHabbit) {
	page.header.name.innerText = activeHabbit.name;

	const progress = activeHabbit.days.length / activeHabbit.target > 1
		? 100
		: activeHabbit.days.length / activeHabbit.target * 100;

	page.header.progressPercent.innerText = progress.toFixed(0) + '%';
	page.header.progressCoverBar.setAttribute('style', `width:${progress}%`);

	if (progress >= 100) {
		page.header.progressCoverBar.classList.add('progress__cover-bar--active');

	} else {
		page.header.progressCoverBar.classList.remove('progress__cover-bar--active');
	};
}


function rerenderContent(activeHabbit) {
	page.content.daysContainer.innerHTML = '';

	for (const index in activeHabbit.days) {
		const element = document.createElement('div');
		element.classList.add('habbit');
		element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
		<div class="habbit__comment">${activeHabbit.days[index].comment}</div>
		<button class="habbit__delete" onclick='deleteDay(${index})'>
			<img src="/images/delete-icon.svg" alt="Удалить день ${Number(index) + 1}">
		</button>`;
		page.content.daysContainer.appendChild(element);
	}

	page.content.nextDays.innerHTML = `День ${activeHabbit.days.length + 1}`;

	const progress = activeHabbit.days.length / activeHabbit.target > 1
	? 100
	: activeHabbit.days.length / activeHabbit.target * 100;

	if (progress > 99) {
		page.content.habbitForm.classList.add('hidden');
	} else {
		page.content.habbitForm.classList.remove('hidden');
	};

}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;
	const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);

	if (!activeHabbit) {
		return;
	};

	document.location.replace(document.location.pathname + '#' + activeHabbit.id);

	rerenderMenu(activeHabbit);
	rerenderHead(activeHabbit);
	rerenderContent(activeHabbit);
}




/* work with days */
function addDays(event) {
	event.preventDefault();

	const data = validateAndGetFormData(event.target, ['comment']);


	if (!data) {
		return;
	};
		
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment: data.comment }])
			}
		}; 
		return habbit;
	});



	resetForm(event.target, ['comment']);
	rerender(globalActiveHabbitId);
	saveData();
}

function deleteDay(index) {
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days
			}
		}
		return habbit;
	})
	rerender(globalActiveHabbitId);
	saveData();
}


/* work with habbits */
function setIcon(context, icon) {
	page.popup.iconField.value = icon;
	const activeIcon = document.querySelector('.popup__icon.menu__item_active');
	const iconName = context.querySelector('.icon').getAttribute('alt');
	page.popup.iconLabel.innerText = iconName;
	context.classList.add('menu__item_active');
	activeIcon.classList.remove('menu__item_active');
}

function addHabbit(event) {
	event.preventDefault();

	const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
	if (!data) {
		return;
	};

	const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);

	habbits.push({
		id: maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: []
	});
	resetForm(event.target, ['name', 'target']);
	togglePopup();
	saveData();
	rerender(maxId + 1);
}


/* init */
(() => {
  	loadData();
	const hashId = Number(document.location.hash.replace('#', ''));
	const urlHabbit = habbits.find(habbit => habbit.id == hashId);
	
	if (urlHabbit) {
		rerender(urlHabbit.id);
	} else {
		rerender(habbits[0].id);
	};
})()


