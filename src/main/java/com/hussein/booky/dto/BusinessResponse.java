package com.hussein.booky.dto;
//business dto response controls the business info returned form the backend to frontend 
public class BusinessResponse {

    private Integer id;
    private String name;
    private String type;
    private String location;
    private String description;
    private Integer ownerId;

    public BusinessResponse(Integer id, String name, String type,
                            String location, String description, Integer ownerId) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.location = location;
        this.description = description;
        this.ownerId = ownerId;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public Integer getOwnerId() {
        return ownerId;
    }
}