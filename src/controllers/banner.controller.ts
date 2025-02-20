import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { yupload } from "../middleware/upload.middleware";
import bannerModel from "../models/banner.model";

export const getBanners = async (
  req: Request,
  res: Response
): Promise<void> => {
  const banners = await bannerModel.find();
  res.json(banners);
};

export const uploadBanner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, title, description } = req.body;

    if (!req.file) {
      res.status(400).json({ message: "Please upload a banner image" });
      return;
    }

    const existing = await bannerModel.findOne({ type });

    if (existing) {
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        existing.imageUrl
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      existing.imageUrl = `/uploads/${req.file.filename}`;
      existing.title = title || existing.title;
      existing.description = description || existing.description;
      await existing.save();

      res.status(200).json({ message: "Banner updated successfully" });
      return;
    }

    const banner = await bannerModel.create({
      type,
      imageUrl: `/uploads/${req.file.filename}`,
      title,
      description,
    });

    res.status(201).json({ message: "Banner uploaded successfully", banner });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    return;
  }
};
