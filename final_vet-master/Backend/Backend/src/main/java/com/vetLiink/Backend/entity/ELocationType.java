package com.vetLiink.Backend.entity;

public enum ELocationType {
    PROVINCE("Province"),
    DISTRICT("District"),
    SECTOR("Sector"),
    VILLAGE("Village"),
    CELL("Cell");

    private final String displayName;

    ELocationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
