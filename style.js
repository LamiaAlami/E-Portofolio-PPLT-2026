const body = document.body;
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id]");
const filterButtons = document.querySelectorAll(".filter-button");
const artifactCards = document.querySelectorAll(".artifact-card");
const studentMaterialTabs = document.querySelectorAll(".student-material-tab");
const studentTypeButtons = document.querySelectorAll(".student-type-button");
const studentWorkCards = document.querySelectorAll(".student-work-card, .product-document");
const backToTop = document.querySelector(".back-to-top");
const defaultArtifactFilter = "rpp";
let activeStudentMaterial = "kolaborasi";
let activeStudentProductType = "poster";
let lastFocusedElement = null;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
}[character]));

menuButton.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

const applyArtifactFilter = (filter) => {
    filterButtons.forEach((item) => {
        item.classList.toggle("active", item.dataset.filter === filter);
    });

    artifactCards.forEach((card) => {
        const shouldShow = card.dataset.category === filter;
        card.classList.toggle("is-hidden", !shouldShow);
    });
};

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        applyArtifactFilter(button.dataset.filter);
    });
});

const applyStudentWorkFilter = () => {
    studentMaterialTabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.material === activeStudentMaterial);
    });

    studentTypeButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.productType === activeStudentProductType);
    });

    studentWorkCards.forEach((card) => {
        const materialMatches = !studentMaterialTabs.length
            || !card.dataset.material
            || card.dataset.material === activeStudentMaterial;
        const typeMatches = activeStudentProductType === "all"
            || card.dataset.productType === activeStudentProductType;

        card.classList.toggle("is-hidden", !(materialMatches && typeMatches));
    });
};

studentMaterialTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activeStudentMaterial = tab.dataset.material;
        applyStudentWorkFilter();
    });
});

studentTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeStudentProductType = button.dataset.productType;
        applyStudentWorkFilter();
    });
});

const artifactModal = document.createElement("div");
artifactModal.className = "artifact-modal";
artifactModal.setAttribute("role", "dialog");
artifactModal.setAttribute("aria-modal", "true");
artifactModal.setAttribute("aria-labelledby", "artifact-modal-title");
artifactModal.innerHTML = `
    <div class="artifact-modal-backdrop" data-close-modal></div>
    <div class="artifact-modal-panel" tabindex="-1">
        <button class="modal-close" type="button" aria-label="Tutup detail artefak" data-close-modal>&times;</button>
        <div class="modal-kicker">Detail Artefak</div>
        <div class="artifact-modal-body"></div>
    </div>
`;
document.body.appendChild(artifactModal);

const modalBody = artifactModal.querySelector(".artifact-modal-body");
const modalPanel = artifactModal.querySelector(".artifact-modal-panel");

const openArtifactModal = (card) => {
    lastFocusedElement = document.activeElement;
    const icon = card.querySelector(".artifact-icon")?.textContent.trim() || "ART";
    const title = card.querySelector("h3")?.textContent.trim() || "Detail Artefak";
    const details = [...card.querySelectorAll("p")]
        .map((paragraph) => paragraph.outerHTML)
        .join("");
    const documentLink = card.querySelector(".document-preview");
    const sourceLink = documentLink || card.querySelector("a.text-link");
    const sourceLabel = documentLink?.querySelector(".document-info strong")?.textContent.trim()
        || sourceLink?.textContent.trim()
        || "Buka dokumen artefak";
    const sourceMarkup = sourceLink
        ? `<a class="text-link modal-source-link" href="${escapeHtml(sourceLink.getAttribute("href") || "#")}" target="_blank" rel="noopener">Buka ${escapeHtml(sourceLabel)}</a>`
        : "";

    modalBody.innerHTML = `
        <div class="modal-title-row">
            <div class="artifact-icon">${escapeHtml(icon)}</div>
            <h3 id="artifact-modal-title">${escapeHtml(title)}</h3>
        </div>
        <div class="modal-detail-copy">${details}</div>
        ${sourceMarkup}
    `;

    body.classList.add("modal-open");
    artifactModal.classList.add("show");
    modalPanel.focus();
};

const closeArtifactModal = () => {
    body.classList.remove("modal-open");
    artifactModal.classList.remove("show");
    modalBody.innerHTML = "";

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
};

artifactCards.forEach((card) => {
    if (["media-ajar", "produk-siswa", "dokumentasi"].includes(card.dataset.category)) {
        return;
    }

    const detailButton = document.createElement("button");
    detailButton.className = "detail-button";
    detailButton.type = "button";
    detailButton.textContent = "Lihat detail";
    detailButton.addEventListener("click", () => openArtifactModal(card));
    card.appendChild(detailButton);
});

artifactModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-modal")) {
        closeArtifactModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && artifactModal.classList.contains("show")) {
        closeArtifactModal();
    }
});

const toggleBackToTop = () => {
    backToTop.classList.toggle("show", window.scrollY > 520);
};

window.addEventListener("scroll", () => {
    toggleBackToTop();
});

backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

toggleBackToTop();
applyArtifactFilter(defaultArtifactFilter);
applyStudentWorkFilter();

// --- KODE NAVIGASI SINGLE PAGE (SPA) ---

// Fungsi untuk mengganti section yang terlihat
const showSection = (targetId) => {
    // Sembunyikan semua section dengan mencabut kelas is-active
    sections.forEach((section) => {
        section.classList.remove("is-active");
    });

    // Tampilkan section yang dituju
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add("is-active");
    }

    // Update highlight tombol navbar di atas
    navLinks.forEach((link) => {
        const linkId = link.getAttribute("href").replace("#", "");
        link.classList.toggle("active", linkId === targetId);
    });

    // Kembalikan posisi scroll ke paling atas halaman secara otomatis
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// Pasangkan event klik ke semua link yang berawalan '#' (Mencakup Navbar & Tombol di bagian Hero)
const hashLinks = document.querySelectorAll('a[href^="#"]');
hashLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href").replace("#", "");
        const targetSection = document.getElementById(targetId);
        
        // Pastikan link tersebut benar-benar mengarah ke tag section yang ada
        if (targetSection && targetSection.tagName.toLowerCase() === 'section') {
            e.preventDefault(); // Mencegah browser melakukan efek scrolling meluncur bawaan
            
            // Tutup menu hamburger jika situs sedang dibuka di versi mobile
            body.classList.remove("nav-open");
            menuButton.setAttribute("aria-expanded", "false");
            
            // Ganti section yang tampil dan ubah URL di address bar
            showSection(targetId);
            history.pushState(null, null, `#${targetId}`);
        }
    });
});

// Tangkap pergerakan ketika user menekan tombol Back atau Forward bawaan browser
window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else {
        showSection("beranda");
    }
});

// Atur section yang pertama kali muncul saat situs baru saja dibuka / di-refresh
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else {
        showSection("beranda"); // Memaksa beranda tampil secara default
    }
});

// Perbarui event scroll karena setActiveNav sudah tidak digunakan
window.addEventListener("scroll", () => {
    toggleBackToTop(); 
});