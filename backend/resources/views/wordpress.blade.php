<style>
#poolPilotsHeaderButtons,
#poolPilotsHeaderButtons * {
    box-sizing: border-box;
}

#poolPilotsHeaderButtons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    gap: 8px;
    width: 100%;
    max-width: 100%;
    font-family: inherit;
}

#poolPilotsHeaderButtons .pp-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 40px;
    padding: 0 12px;

    border: 0;
    border-radius: 11px;

    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;

    text-align: center;
    text-decoration: none !important;
    white-space: nowrap;

    transition:
        background-color 0.2s ease,
        transform 0.2s ease;
}

#poolPilotsHeaderButtons .pp-button:hover {
    transform: translateY(-1px);
}

/* Quote button */

#poolPilotsHeaderButtons .pp-quote {
    background: #6750a4;
    color: #ffffff !important;
}

#poolPilotsHeaderButtons .pp-quote:hover {
    background: #503b88;
    color: #ffffff !important;
}

/* Call buttons */

#poolPilotsHeaderButtons .pp-call {
    background: #ffa000;
    color: #18121f !important;
}

#poolPilotsHeaderButtons .pp-call:hover {
    background: #e89000;
    color: #18121f !important;
}

/* Smaller desktop */

@media (max-width: 1450px) {
    #poolPilotsHeaderButtons {
        gap: 6px;
    }

    #poolPilotsHeaderButtons .pp-button {
        min-height: 38px;
        padding: 0 10px;
        border-radius: 9px;
        font-size: 11px;
    }
}

/* Tablet */

@media (max-width: 1024px) {
    #poolPilotsHeaderButtons {
        justify-content: center;
        flex-wrap: wrap;
    }
}

/* Mobile */

@media (max-width: 767px) {
    #poolPilotsHeaderButtons {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
    }

    #poolPilotsHeaderButtons .pp-button {
        width: 100%;
        min-height: 40px;
        font-size: 12px;
    }
}
</style>

<div
    id="poolPilotsHeaderButtons"
    style="
        display:flex;
        align-items:center;
        justify-content:flex-end;
        flex-wrap:nowrap;
        gap:8px;
        width:100%;
        max-width:100%;
    "
>
    <a
        class="pp-button pp-quote"
        href="/get-a-quote/"
        style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            min-height:40px;
            padding:0 12px;
            border-radius:11px;
            background:#6750a4;
            color:#ffffff;
            text-decoration:none;
            font-family:inherit;
            font-size:12px;
            font-weight:800;
            line-height:1;
            white-space:nowrap;
        "
    >
        Get a Fast Quote
    </a>

    <a
        class="pp-button pp-call"
        href="tel:6028427178"
        aria-label="Call Pool Pilots at 602-842-7178"
        style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            min-height:40px;
            padding:0 12px;
            border-radius:11px;
            background:#ffa000;
            color:#18121f;
            text-decoration:none;
            font-family:inherit;
            font-size:12px;
            font-weight:800;
            line-height:1;
            white-space:nowrap;
        "
    >
        Call Us: (602) 842-7178
    </a>

   
</div>