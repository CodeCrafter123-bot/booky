package com.hussein.booky.dto;

public class BookyServiceResponse {

    private Integer id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private Double price;
    private Boolean active;
    private Integer businessId;
    private String businessName;

    public BookyServiceResponse(Integer id, String name, String description,
                                Integer durationMinutes, Double price, Boolean active,
                                Integer businessId, String businessName) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.price = price;
        this.active = active;
        this.businessId = businessId;
        this.businessName = businessName;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public Double getPrice() { return price; }
    public Boolean getActive() { return active; }
    public Integer getBusinessId() { return businessId; }
    public String getBusinessName() { return businessName; }
}