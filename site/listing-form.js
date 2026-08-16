import { apiRequest, getSession, renderGoogleSignIn, signOut } from './aws-client.js';
import { awsConfig } from './aws-config.js';
import { categoryLabel, LISTING_CATEGORIES, validateListing } from './listing-policy.js';

const setupNotice = document.querySelector('[data-setup-notice]');
const signedOut = document.querySelector('[data-signed-out]');
const signedIn = document.querySelector('[data-signed-in]');
const providerButtons = document.querySelector('[data-provider-buttons]');
const identity = document.querySelector('[data-identity]');
const form = document.querySelector('[data-listing-form]');
const category = form.elements.category;
const formStatus = document.querySelector('[data-form-status]');
const deleteButton = document.querySelector('[data-delete-listing]');
const signOutButton = document.querySelector('[data-sign-out]');
let session = null;

for (const [value, label] of LISTING_CATEGORIES) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  category.append(option);
}

function currentProvider() {
  return session?.provider || '';
}

function setStatus(message, kind = '') {
  formStatus.textContent = message;
  formStatus.dataset.kind = kind;
}

function setBusy(busy) {
  [...form.elements].forEach((element) => { element.disabled = busy; });
  signOutButton.disabled = busy;
}

function populateForm(listing) {
  if (!listing) return;
  for (const field of ['businessName', 'category', 'address', 'postalCode', 'website', 'phone']) {
    if (field in listing && form.elements[field]) form.elements[field].value = listing[field] || '';
  }
  deleteButton.hidden = false;
  setStatus('Your published listing is ready to edit.', 'success');
}

function renderDisabledProvider() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sso-button';
  button.textContent = 'Continue with Google';
  button.disabled = true;
  providerButtons.replaceChildren(button);
}

async function initialize() {
  if (!awsConfig.enabled) {
    renderDisabledProvider();
    setupNotice.hidden = false;
    setupNotice.textContent = 'Self-service sign-in is being connected. The directory and listing policy are ready; publishing will open after the no-cost identity service is activated.';
    signedOut.hidden = false;
    return;
  }

  session = getSession();
  if (!session) {
    signedOut.hidden = false;
    try {
      await renderGoogleSignIn(providerButtons, () => window.location.reload());
    } catch (error) {
      setupNotice.hidden = false;
      setupNotice.textContent = error.message;
    }
    return;
  }

  signedIn.hidden = false;
  identity.textContent = `Signed in with ${currentProvider() || 'an approved provider'}`;
  try {
    const { listing } = await apiRequest('/me');
    populateForm(listing);
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  values.authorizedToList = form.elements.authorizedToList.checked;
  values.accurateAndLawful = form.elements.accurateAndLawful.checked;
  values.provider = currentProvider();
  const result = validateListing(values);
  if (!result.valid) {
    setStatus(result.errors.join(' '), 'error');
    return;
  }

  setBusy(true);
  setStatus('Publishing your listing…');
  try {
    const { listing } = await apiRequest('/listing', { method: 'PUT', body: JSON.stringify(result.listing) });
    populateForm(listing);
    setStatus(`${listing.businessName} is published in the community directory.`, 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    setBusy(false);
  }
});

deleteButton.addEventListener('click', async () => {
  if (!window.confirm('Remove your listing from the public directory?')) return;
  setBusy(true);
  try {
    await apiRequest('/listing', { method: 'DELETE' });
    form.reset();
    form.elements.postalCode.value = '94030';
    deleteButton.hidden = true;
    setStatus('Your listing was removed.', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    setBusy(false);
  }
});

signOutButton.addEventListener('click', () => {
  signOut();
  window.location.reload();
});

initialize();
